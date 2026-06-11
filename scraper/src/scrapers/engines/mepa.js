import { fetchPage, extractCategory } from '../utils.js'
import * as queries from '../../db/queries.js'
import logger from '../../logger.js'

const CONSIP_API_BASE = 'https://dati.consip.it/download/dataset'
const IT_RELEVANT_CATEGORIES = [
  'Informatica, servizi IT e digitali',
  'Servizi',
  'Telefonia e comunicazioni',
  'Energia e servizi pubblici',
  'Centri di elaborazione dati',
  'Cloud e data center',
  'Sicurezza',
  'Software e licenze',
]

export async function scrape(config = {}) {
  const results = []
  const year = new Date().getFullYear()
  const years = config.years || [year, year - 1]

  for (const y of years) {
    try {
      const data = await fetchConsipData(y, config)
      const filtered = filterRelevant(data, config)
      logger.info(`[Consip] Year ${y}: ${data.length} total tenders, ${filtered.length} IT-relevant`)
      results.push(...filtered)
    } catch (err) {
      logger.error(`[Consip] Error fetching year ${y}: ${err.message}`)
    }
  }

  const deduped = deduplicateResults(results)
  logger.info(`[Consip] Total after dedup: ${deduped.length}`)
  return deduped
}

async function fetchConsipData(year, config) {
  const url = `${CONSIP_API_BASE}/bandiegare${year}.json`
  logger.info(`[Consip] Fetching ${url}`)
  
  const html = await fetchPage(url, {
    timeout: config.timeout || 60000,
    headers: { 'Accept': 'application/json' },
  })

  try {
    const data = JSON.parse(html)
    return Array.isArray(data) ? data : []
  } catch (err) {
    logger.error(`[Consip] Failed to parse JSON for year ${year}: ${err.message}`)
    return []
  }
}

function filterRelevant(tenders, config) {
  const keywords = config.keywords || [
    'software', 'informatic', 'digitale', 'cloud', 'piattaforma', 'app',
    'web', 'IT ', 'servizi IT', 'data center', 'data center', 'cybersecurity',
    'server', 'hosting', 'SaaS', 'licenze', 'manutenzione software',
    'sviluppo', 'consulenz', 'sistemista', 'rete', 'network',
  ]

  return tenders.filter(tender => {
    const bandoName = (tender['#Denominazione_Bando'] || tender.Denominazione_Bando || '').toLowerCase()
    const lottoName = (tender.Denominazione_Lotto || '').toLowerCase()
    const category = (tender.Categoria_Merceologica || '').toLowerCase()
    const text = `${bandoName} ${lottoName} ${category}`

    const isItCategory = IT_RELEVANT_CATEGORIES.some(cat => category.includes(cat.toLowerCase()))
    const isItKeyword = keywords.some(kw => text.includes(kw.toLowerCase()))

    return isItCategory || isItKeyword
  }).map(tender => mapConsipTender(tender))
}

function mapConsipTender(t) {
  const bandoName = t['#Denominazione_Bando'] || t.Denominazione_Bando || 'Bando senza titolo'
  const lottoName = t.Denominazione_Lotto || ''
  const title = lottoName ? `${bandoName} — ${lottoName}` : bandoName
  
  const baseAsta = parseItalianNumber(t.Base_Asta)
  const importMassimale = parseItalianNumber(t.Importo_Massimale)
  const estimatedValue = importMassimale || baseAsta || null

  const deadlineStr = t.Data_Termine || t.Data_Attivazione || t.Data_Pubblicazione
  const pubDateStr = t.Data_Pubblicazione
  const category = mapCategory(t.Categoria_Merceologica || '')

  return {
    external_id: `consip-${t.Identificativo_Lotto || t['#Denominazione_Bando']?.replace(/\s+/g, '-').substring(0, 50) || Math.random().toString(36).slice(2, 10)}`,
    title: title.substring(0, 255),
    issuer: 'Consip S.p.A.',
    summary: buildSummary(t),
    source_url: `https://www.acquistinretepa.it/`,
    publication_date: parseItalianDate(pubDateStr),
    deadline_at: parseItalianDate(deadlineStr),
    estimated_value: estimatedValue,
    category,
    region: 'Italia',
    raw_payload_json: t,
  }
}

function buildSummary(t) {
  const parts = []
  if (t.Tipo_Strumento) parts.push(`Strumento: ${t.Tipo_Strumento}`)
  if (t.Tipo_Procedura) parts.push(`Procedura: ${t.Tipo_Procedura}`)
  if (t.Criterio_Aggiudicazione) parts.push(`Criterio: ${t.Criterio_Aggiudicazione}`)
  if (t.Categoria_Merceologica) parts.push(`Categoria: ${t.Categoria_Merceologica}`)
  if (t.Quantita_Massimale) parts.push(`Quantità massima: ${t.Quantita_Massimale} ${t.Unita_Misura || ''}`)
  if (t.Percentuale_Erosione) parts.push(`Erosione: ${t.Percentuale_Erosione}%`)
  if (t.Numero_Operatori_Economici_Aggiudicatari_Abilitati) parts.push(`Aggiudicatari: ${t.Numero_Operatori_Economici_Aggiudicatari_Abilitati}`)
  return parts.join('. ')
}

function mapCategory(cat) {
  const c = (cat || '').toLowerCase()
  if (c.includes('informatic') || c.includes('software') || c.includes('digital') || c.includes('data')) return 'Informatica'
  if (c.includes('sanit')) return 'Sanita'
  if (c.includes('veicol') || c.includes('trasport') || c.includes('mobilit')) return 'Trasporti'
  if (c.includes('ediliz') || c.includes('costruz') || c.includes('manutenzion')) return 'Edilizia'
  if (c.includes('energ') || c.includes('elettr')) return 'Energia'
  if (c.includes('sicurezz') || c.includes('vigilanz')) return 'Sicurezza'
  if (c.includes('servizi')) return 'Servizi'
  if (c.includes('fornitur')) return 'Fornitura'
  return extractCategory(cat, '') || 'Altro'
}

function parseItalianNumber(str) {
  if (!str) return null
  const cleaned = String(str).replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function parseItalianDate(str) {
  if (!str) return null
  const match = str.match(/(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (match) {
    const [, d, m, y] = match
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  try {
    const d = new Date(str)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  } catch { /* ignore */ }
  return null
}

function deduplicateResults(results) {
  const seen = new Set()
  return results.filter(r => {
    if (seen.has(r.external_id)) return false
    seen.add(r.external_id)
    return true
  })
}