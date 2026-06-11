import * as queries from './tenders.queries.js'
import logger from '../../config/logger.js'
import { log as auditLog } from '../audit/audit.service.js'

async function listTenders(tenantId, filters, pagination) {
  return queries.getTendersByTenant(tenantId, filters, pagination)
}

async function getTenderDetail(tenderId, tenantId) {
  const tender = await queries.getTenderById(tenderId, tenantId)
  if (!tender) {
    throw Object.assign(new Error('Gara non trovata.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }
  return tender
}

async function createTender(payload, userId, tenantId, req) {
  const tenderId = await queries.insertTender({
    ...payload,
    tenantId,
    createdBy: userId,
  })

  logger.info('Tender created', { tenderId, tenantId, userId })
  auditLog('tender.created', 'tender', tenderId, userId, tenantId, { title: payload.title }, req)

  return queries.getTenderById(tenderId, tenantId)
}

async function updateTender(tenderId, payload, tenantId, userId, req) {
  const existing = await queries.getTenderById(tenderId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Gara non trovata.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.updateTender(tenderId, tenantId, payload)
  logger.info('Tender updated', { tenderId, tenantId })
  auditLog('tender.updated', 'tender', tenderId, userId, tenantId, { changes: Object.keys(payload) }, req)

  return queries.getTenderById(tenderId, tenantId)
}

async function deleteTender(tenderId, tenantId, userId, req) {
  const existing = await queries.getTenderById(tenderId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Gara non trovata.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.softDeleteTender(tenderId, tenantId)
  logger.info('Tender deleted', { tenderId, tenantId })
  auditLog('tender.deleted', 'tender', tenderId, userId, tenantId, null, req)
}

async function changeStatus(tenderId, status, tenantId, userId, req) {
  const existing = await queries.getTenderById(tenderId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Gara non trovata.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  const validStatuses = ['draft', 'active', 'submitted', 'won', 'lost', 'cancelled']
  if (!validStatuses.includes(status)) {
    throw Object.assign(new Error('Stato non valido.'), {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
    })
  }

  await queries.updateTenderStatus(tenderId, tenantId, status)
  logger.info('Tender status changed', { tenderId, status, tenantId })
  auditLog('tender.status_changed', 'tender', tenderId, userId, tenantId, { from: existing.status, to: status }, req)
}

async function assignTender(tenderId, assignments, tenantId, userId, req) {
  const existing = await queries.getTenderById(tenderId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Gara non trovata.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.assignUsersToTender(tenderId, assignments)
  logger.info('Tender assigned', { tenderId, tenantId })
  auditLog('tender.assigned', 'tender', tenderId, userId, tenantId, { assignments }, req)
}

async function getDashboardStats(tenantId) {
  return queries.getTenderDashboardStats(tenantId)
}

export {
  listTenders,
  getTenderDetail,
  createTender,
  updateTender,
  deleteTender,
  changeStatus,
  assignTender,
  getDashboardStats,
}
