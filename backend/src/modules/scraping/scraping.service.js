import * as queries from './scraping.queries.js'
import { log as auditLog } from '../audit/audit.service.js'
import logger from '../../config/logger.js'

async function listSources(tenantId) {
  return queries.getSourcesByTenant(tenantId)
}

async function addSource(payload, userId, tenantId, req) {
  const sourceId = await queries.createSource({
    tenantId,
    name: payload.name,
    sourceType: payload.sourceType,
    baseUrl: payload.baseUrl,
    configJson: payload.configJson,
    isActive: payload.isActive,
  })
  logger.info('Scraping source created', { sourceId, tenantId, userId })
  auditLog('scraping.source_created', 'scraping_source', sourceId, userId, tenantId, null, req)
  return queries.getSourcesByTenant(tenantId)
}

async function removeSource(sourceId, tenantId, userId, req) {
  const deleted = await queries.deleteSource(sourceId, tenantId)
  if (!deleted) {
    throw Object.assign(new Error('Sorgente non trovata.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }
  logger.info('Scraping source deleted', { sourceId, tenantId })
  auditLog('scraping.source_deleted', 'scraping_source', sourceId, userId, tenantId, null, req)
}

async function listScrapedTenders(tenantId, filters) {
  return queries.getScrapedTendersByTenant(tenantId, filters)
}

async function changeScrapedStatus(scrapedId, status, tenantId, userId, req) {
  const valid = ['new', 'saved', 'dismissed']
  if (!valid.includes(status)) {
    throw Object.assign(new Error('Stato non valido.'), {
      statusCode: 422, code: 'VALIDATION_ERROR',
    })
  }
  const updated = await queries.updateScrapedTenderStatus(scrapedId, status, tenantId)
  if (!updated) {
    throw Object.assign(new Error('Bando non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }
  logger.info('Scraped tender status changed', { scrapedId, status, tenantId })
  auditLog('scraping.tender_status_changed', 'scraped_tender', scrapedId, userId, tenantId, { status }, req)
}

async function convertToTender(scrapedId, userId, tenantId, req) {
  const tenderId = await queries.convertScrapedTenderToTender(scrapedId, tenantId, userId)
  if (!tenderId) {
    throw Object.assign(new Error('Bando non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }
  logger.info('Scraped tender converted', { scrapedId, tenderId, tenantId })
  auditLog('scraping.tender_converted', 'scraped_tender', scrapedId, userId, tenantId, { tenderId }, req)
  return { tenderId }
}

export { listSources, addSource, removeSource, listScrapedTenders, changeScrapedStatus, convertToTender }
