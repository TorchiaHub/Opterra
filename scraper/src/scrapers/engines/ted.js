import * as cheerio from 'cheerio'
import { fetchPage, delay, normalizeText, parseDateString, parseValue, extractCategory, extractRegion } from '../utils.js'

const TED_BASE = 'https://ted.europa.eu'

export async function scrape(config = {}) {
  const results = []
  const cpvCodes = config.cpvCodes || DEFAULT_CPV_CODES
  const maxPages = config.maxPages || 3

  for (const cpv of cpvCodes) {
    try {
      const pageResults = await searchTed(cpv, 1, config)
      if (pageResults.length === 0) continue
      results.push(...pageResults)

      for (let p = 2; p <= maxPages; p++) {
        await delay()
        const more = await searchTed(cpv, p, config)
        if (more.length === 0) break
        results.push(...more)
      }
    } catch (err) {
      console.error(`[TED] Error scraping CPV ${cpv}: ${err.message}`)
    }
    await delay()
  }

  return deduplicateResults(results)
}

const DEFAULT_CPV_CODES = [
  '48000000', // Software
  '72000000', // IT services
  '72200000', // Programming
  '72300000', // Data processing
  '30200000', // IT equipment
]

async function searchTed(cpv, page, config) {
  const searchUrl = `${TED_BASE}/Ted-finder/search/results?isFlexible=true&scope=FT&cpvCodes=${cpv}&cnCodes=IT&page=${page}`
  const html = await fetchPage(searchUrl, { timeout: config.timeout })

  const $ = cheerio.load(html)
  const tenders = []

  const selectors = [
    '.search-result-item',
    '.result-item',
    'article',
    '.notice-item',
    '.card',
    'table.results-table tbody tr',
  ]

  let items = $()
  for (const sel of selectors) {
    items = $(sel)
    if (items.length > 0) break
  }

  if (items.length === 0) {
    items = $('a[href*="/notice/"], a[href*="ted.europa.eu"]').closest('tr, li, div').slice(0, 20)
  }

  items.each(function () {
    const el = $(this)
    const title = normalizeText(el.find('h2, h3, h4, .title, a').first().text())
    if (!title || title.length < 5) return

    const link = el.find('a').first().attr('href') || ''
    const externalId = extractTedId(link)
    if (!externalId) return

    const description = normalizeText(el.find('p, .description, .abstract').first().text())
    const issuer = normalizeText(el.find('.authority, .buyer, .ente').first().text())
    const deadlineStr = normalizeText(el.find('.deadline, .date, time').first().text())
    const valueStr = normalizeText(el.find('.value, .amount').first().text())
    const dateStr = normalizeText(el.find('.publication-date, .published').first().text())

    tenders.push({
      external_id: `ted-${externalId}`,
      title,
      issuer: issuer || null,
      summary: description || null,
      source_url: link.startsWith('http') ? link : (link ? `${TED_BASE}${link}` : null),
      publication_date: parseDateString(dateStr),
      deadline_at: parseDateString(deadlineStr),
      estimated_value: parseValue(valueStr),
      category: extractCategory(title, description),
      region: extractRegion(`${issuer} ${title}`),
      raw_payload_json: {
        source: 'ted',
        cpv,
        page,
        scraped_at: new Date().toISOString(),
      },
    })
  })

  return tenders
}

function extractTedId(href) {
  if (!href) return null
  const match = href.match(/notice\/([\w-]+)/)
  if (match) return match[1]
  const hash = href.split('/').pop()?.split('?')[0]
  return hash && hash.length >= 4 ? hash : null
}

function deduplicateResults(results) {
  const seen = new Set()
  return results.filter(r => {
    if (seen.has(r.external_id)) return false
    seen.add(r.external_id)
    return true
  })
}