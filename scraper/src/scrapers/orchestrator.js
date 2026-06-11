import { getDb } from '../db/database.js'
import * as queries from '../db/queries.js'
import { scrape as scrapeConsip } from './engines/mepa.js'
import { scrape as scrapeDatiGov } from './engines/datigovit.js'
import { scrape as scrapeTed } from './engines/ted.js'
import { scrape as scrapeGazzetta } from './engines/gazzetta.js'
import { scrape as scrapeCustom } from './engines/custom.js'
import logger from '../logger.js'

const ENGINES = {
  consip: { scrape: scrapeConsip, label: 'Consip Open Data (Bandi e Gare)' },
  datigovit: { scrape: scrapeDatiGov, label: 'Dati.gov.it (Open Data Regionali)' },
  ted: { scrape: scrapeTed, label: 'TED (EU)' },
  gazzetta: { scrape: scrapeGazzetta, label: 'Gazzetta Ufficiale' },
  custom: { scrape: scrapeCustom, label: 'Custom Source' },
  mepa: { scrape: scrapeConsip, label: 'Consip Open Data (MEPA compat.)' },
}

export async function runSource(sourceId) {
  const source = queries.getSourceById(sourceId)
  if (!source) throw new Error(`Source ${sourceId} non trovata`)
  if (!source.is_active) throw new Error(`Source "${source.name}" non attiva`)

  const engine = ENGINES[source.source_type]
  if (!engine) throw new Error(`Tipo source "${source.source_type}" non supportato`)

  let config = {}
  if (source.config_json) {
    try { config = JSON.parse(source.config_json) } catch { config = {} }
  }
  config.timeout = parseInt(process.env.SCRAPER_TIMEOUT) || 30000

  const jobId = queries.createJob(sourceId)
  logger.info(`[Scraper] Job ${jobId} started for source "${source.name}" (${source.source_type})`)

  let totalFound = 0
  let totalNew = 0
  let errorMsg = null

  try {
    const results = await engine.scrape(config)
    totalFound = results.length

    for (const item of results) {
      try {
        const enriched = await enrichTender(item, source.id)
        queries.insertScrapedTender(enriched)
        totalNew++
      } catch (err) {
        if (err.message?.includes('UNIQUE constraint')) {
          // already exists, skip
        } else {
          logger.warn(`[Scraper] Error inserting tender "${item.title}": ${err.message}`)
        }
      }
    }

    queries.completeJob(jobId, totalFound, totalNew)
    queries.updateSourceLastRun(sourceId)
    logger.info(`[Scraper] Job ${jobId} completed: ${totalFound} found, ${totalNew} new`)
  } catch (err) {
    errorMsg = err.message
    queries.completeJob(jobId, 0, 0, errorMsg)
    logger.error(`[Scraper] Job ${jobId} failed: ${errorMsg}`)
  }

  return { jobId, sourceId, sourceName: source.name, sourceType: source.source_type, totalFound, totalNew, errorMsg }
}

export async function runAllActive() {
  const sources = queries.getSources(true)
  const results = []

  for (const source of sources) {
    try {
      const result = await runSource(source.id)
      results.push(result)
    } catch (err) {
      results.push({ sourceId: source.id, sourceName: source.name, errorMsg: err.message })
    }
  }

  return results
}

async function enrichTender(item, sourceId) {
  const { analyzeTender } = await import('../services/ai.service.js')
  try {
    const analysis = await analyzeTender(item.title, item.summary || '', item.estimated_value, item.category)
    return {
      ...item,
      source_id: sourceId,
      ai_relevance_score: analysis.relevanceScore,
      ai_tags_json: analysis.tags,
      ai_summary: analysis.summary,
      ai_analysis_json: analysis,
    }
  } catch (err) {
    logger.warn(`[Scraper] AI enrichment failed for "${item.title}": ${err.message}`)
    return {
      ...item,
      source_id: sourceId,
      ai_relevance_score: null,
      ai_tags_json: null,
      ai_summary: null,
      ai_analysis_json: null,
    }
  }
}

export { ENGINES }