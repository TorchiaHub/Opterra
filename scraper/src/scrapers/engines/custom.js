import * as cheerio from 'cheerio'
import { fetchPage, delay, normalizeText, parseDateString, parseValue, extractCategory, extractRegion } from '../utils.js'

export async function scrape(config = {}) {
  const results = []
  const pages = config.maxPages || 3

  for (let page = 1; page <= pages; page++) {
    try {
      const tenders = await scrapeCustomSource(page, config)
      if (tenders.length === 0) break
      results.push(...tenders)
    } catch (err) {
      console.error(`[Custom/${config.name}] Error on page ${page}: ${err.message}`)
    }
    if (page < pages) await delay()
  }

  return deduplicateResults(results)
}

async function scrapeCustomSource(page, config) {
  const url = config.url.replace('{page}', page)
  const html = await fetchPage(url, { timeout: config.timeout })
  const $ = cheerio.load(html)

  const tenders = []
  const selectors = config.selectors || DEFAULT_SELECTORS
  const listSelector = selectors.list || '.results li, .list-item, article, .card'
  const items = $(listSelector)

  items.each(function () {
    const el = $(this)
    const title = normalizeText(el.find(selectors.title || 'h2, h3, h4, .title').first().text())
    if (!title || title.length < 5) return

    const link = el.find(selectors.link || 'a').first().attr('href') || ''
    const externalId = extractCustomId(link) || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const description = selectors.description
      ? normalizeText(el.find(selectors.description).first().text())
      : normalizeText(el.find('p, .description, .abstract').first().text())

    const issuer = selectors.issuer
      ? normalizeText(el.find(selectors.issuer).first().text())
      : null

    const deadlineStr = selectors.deadline
      ? normalizeText(el.find(selectors.deadline).first().text())
      : null
    const dateStr = selectors.date
      ? normalizeText(el.find(selectors.date).first().text())
      : null
    const valueStr = selectors.value
      ? normalizeText(el.find(selectors.value).first().text())
      : null

    const fullLink = link.startsWith('http') ? link : (config.baseUrl ? `${config.baseUrl}${link}` : link)

    tenders.push({
      external_id: `${config.idPrefix || 'custom'}-${externalId}`,
      title,
      issuer,
      summary: description || null,
      source_url: fullLink || null,
      publication_date: parseDateString(dateStr),
      deadline_at: parseDateString(deadlineStr),
      estimated_value: parseValue(valueStr),
      category: extractCategory(title, description),
      region: extractRegion(`${issuer || ''} ${title}`),
      raw_payload_json: {
        source: config.name || 'custom',
        page,
        scraped_at: new Date().toISOString(),
      },
    })
  })

  return tenders
}

const DEFAULT_SELECTORS = {
  list: '.results li, .list-item, article, .card',
  title: 'h2, h3, h4, .title',
  link: 'a',
  description: 'p, .description, .abstract',
  deadline: '.deadline, .scadenza, [data-date]',
  date: '.date, .published, time',
  value: '.value, .importo, .budget',
}

function extractCustomId(href) {
  if (!href) return null
  const match = href.match(/(\d{3,})/)
  return match ? match[1] : null
}

function deduplicateResults(results) {
  const seen = new Set()
  return results.filter(r => {
    if (seen.has(r.external_id)) return false
    seen.add(r.external_id)
    return true
  })
}