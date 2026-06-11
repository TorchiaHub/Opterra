import * as cheerio from 'cheerio'
import { fetchPage, delay, normalizeText, parseDateString, parseValue, extractCategory, extractRegion } from '../utils.js'

const GAZZETTA_BASE = 'https://www.gazzettaufficiale.it'

export async function scrape(config = {}) {
  const results = []
  const keywords = config.keywords || ['appalto', 'gara', 'fornitura', 'servizio']
  const maxPages = config.maxPages || 2

  for (const keyword of keywords) {
    try {
      const pageResults = await searchGazzetta(keyword, 1, config)
      if (pageResults.length === 0) continue
      results.push(...pageResults)

      for (let p = 2; p <= maxPages; p++) {
        await delay()
        const more = await searchGazzetta(keyword, p, config)
        if (more.length === 0) break
        results.push(...more)
      }
    } catch (err) {
      console.error(`[Gazzetta] Error searching "${keyword}": ${err.message}`)
    }
    await delay()
  }

  return deduplicateResults(results)
}

async function searchGazzetta(keyword, page, config) {
  const searchUrl = `${GAZZETTA_BASE}/ricerca pst/1?testo=${encodeURIComponent(keyword)}&pagina=${page}`
  const html = await fetchPage(searchUrl, { timeout: config.timeout })

  const $ = cheerio.load(html)
  const tenders = []

  const selectors = [
    '.search-result',
    '.result-item',
    '.risultato',
    '.bando-item',
    'article',
    '.card',
    '.elenco-risultati li',
  ]

  let items = $()
  for (const sel of selectors) {
    items = $(sel)
    if (items.length > 0) break
  }

  if (items.length === 0) {
    items = $('a[href*="/gazzetta/"], a[href*="/atto/"]').closest('li, div, tr').slice(0, 20)
  }

  items.each(function () {
    const el = $(this)
    const title = normalizeText(el.find('h2, h3, h4, .title, .titolo, a').first().text())
    if (!title || title.length < 10) return

    const link = el.find('a').first().attr('href') || ''
    const externalId = extractGazzettaId(link)
    if (!externalId) return

    const description = normalizeText(el.find('p, .description, .abstract, .descrizione').first().text())
    const issuer = normalizeText(el.find('.ente, .authority, .emettitore').first().text())
    const dateStr = normalizeText(el.find('.date, .data, time').first().text())
    const valueStr = normalizeText(el.find('.importo, .value').first().text())

    tenders.push({
      external_id: `gazzetta-${externalId}`,
      title,
      issuer: issuer || null,
      summary: description || null,
      source_url: link.startsWith('http') ? link : `${GAZZETTA_BASE}${link}`,
      publication_date: parseDateString(dateStr),
      deadline_at: null,
      estimated_value: parseValue(valueStr),
      category: extractCategory(title, description),
      region: extractRegion(`${issuer} ${title}`),
      raw_payload_json: {
        source: 'gazzetta',
        keyword,
        page,
        scraped_at: new Date().toISOString(),
      },
    })
  })

  return tenders
}

function extractGazzettaId(href) {
  if (!href) return null
  const match = href.match(/(\d{4,})/)
  if (match) return match[1]
  const segments = href.split('/').filter(Boolean)
  const last = segments[segments.length - 1]?.split('?')[0]?.split('#')[0]
  return last && last.length >= 4 ? last : null
}

function deduplicateResults(results) {
  const seen = new Set()
  return results.filter(r => {
    if (seen.has(r.external_id)) return false
    seen.add(r.external_id)
    return true
  })
}