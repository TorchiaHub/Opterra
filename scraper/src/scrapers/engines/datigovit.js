import { fetchPage } from '../utils.js'
import logger from '../../logger.js'

const DATIGOV_API = 'https://dati.gov.it/opendata/api/3/action/package_search'

export async function scrape(config = {}) {
  const results = []
  const queries = config.queries || ['bandi gara software', 'appalti informatica', 'contratti digitali']

  for (const query of queries) {
    try {
      const datasets = await searchOpenData(query)
      for (const ds of datasets) {
        const csvResources = ds.resources?.filter(r =>
          r.format?.toLowerCase() === 'csv' || r.url?.endsWith('.csv')
        ) || []
        const jsonResources = ds.resources?.filter(r =>
          r.format?.toLowerCase() === 'json' || r.url?.endsWith('.json')
        ) || []

        const resources = jsonResources.length > 0 ? jsonResources : csvResources
        if (resources.length === 0) continue

        for (const resource of resources.slice(0, 1)) {
          try {
            const tenders = await fetchAndParseResource(resource.url, ds, query)
            results.push(...tenders)
          } catch (err) {
            logger.error(`[datigovit] Error fetching resource ${resource.url}: ${err.message}`)
          }
        }
        logger.info(`[datigovit] Dataset "${ds.title}": ${resources.length} resources`)
      }
    } catch (err) {
      logger.error(`[datigovit] Error searching "${query}": ${err.message}`)
    }
  }

  return deduplicateResults(results)
}

async function searchOpenData(query) {
  const url = `${DATIGOV_API}?q=${encodeURIComponent(query)}&rows=10&sort=score desc`
  const html = await fetchPage(url, { timeout: 30000 })
  const data = JSON.parse(html)
  return data?.result?.results || []
}

async function fetchAndParseResource(url, dataset, query) {
  const text = await fetchPage(url, { timeout: 60000 })

  try {
    const json = JSON.parse(text)
    if (Array.isArray(json)) {
      return json.slice(0, 100).map(item => mapOpenDataItem(item, dataset))
    }
    if (json.result?.records && Array.isArray(json.result.records)) {
      return json.result.records.slice(0, 100).map(item => mapOpenDataItem(item, dataset))
    }
    return []
  } catch {
    // Not JSON, skip CSV parsing for now
    return []
  }
}

function mapOpenDataItem(item, dataset) {
  const title = item.Denominazione_Bando || item.Oggetto || item.Titolo || item.title || item.oggetto || 'Bando senza titolo'
  const issuer = item.Ente_Appaltante || item.ente || item.Denominazione_Amministrazione || dataset.organization?.title || 'Ente pubblico'
  const value = parseItalianNumber(item.Base_Asta || item.Importo || item.importo || item.base_asta || item.valore)
  const deadline = item.Data_Termine || item.data_scadenza || item.scadenza || item.deadline || null
  const pubDate = item.Data_Pubblicazione || item.data_pubblicazione || item.published || null

  return {
    external_id: `datigov-${item.CIG || item.id || item.identificativo || Math.random().toString(36).slice(2, 10)}`,
    title: String(title).substring(0, 255),
    issuer: String(issuer).substring(0, 255),
    summary: buildOpenDataSummary(item),
    source_url: dataset.url || '',
    publication_date: parseFlexibleDate(pubDate),
    deadline_at: parseFlexibleDate(deadline),
    estimated_value: value,
    category: item.Categoria_Merceologica || item.categoria || 'Altro',
    region: item.Regione || item.Provincia || item.regione || 'Italia',
    raw_payload_json: { dataset: dataset.name, query: query, item },
  }
}

function buildOpenDataSummary(item) {
  const parts = []
  if (item.Tipo_Procedura) parts.push(`Procedura: ${item.Tipo_Procedura}`)
  if (item.Tipo_Strumento) parts.push(`Strumento: ${item.Tipo_Strumento}`)
  if (item.CIG) parts.push(`CIG: ${item.CIG}`)
  return parts.join('. ') || 'Bando da dati aperti regionali'
}

function parseItalianNumber(str) {
  if (!str) return null
  if (typeof str === 'number') return str
  const cleaned = String(str).replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function parseFlexibleDate(str) {
  if (!str) return null
  if (typeof str !== 'string') return null
  // DD-MM-YYYY
  const it = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/)
  if (it) return `${it[3]}-${it[2].padStart(2, '0')}-${it[1].padStart(2, '0')}`
  // YYYY-MM-DD
  const iso = str.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/)
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`
  try { const d = new Date(str); return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10) } catch { return null }
}

function deduplicateResults(results) {
  const seen = new Set()
  return results.filter(r => {
    if (seen.has(r.external_id)) return false
    seen.add(r.external_id)
    return true
  })
}