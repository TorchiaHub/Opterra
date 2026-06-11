import * as queries from './tenders.queries.js'
import logger from '../../config/logger.js'

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

async function createTender(payload, userId, tenantId) {
  const tenderId = await queries.insertTender({
    ...payload,
    tenantId,
    createdBy: userId,
  })

  logger.info('Tender created', { tenderId, tenantId, userId })

  return queries.getTenderById(tenderId, tenantId)
}

async function updateTender(tenderId, payload, tenantId) {
  const existing = await queries.getTenderById(tenderId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Gara non trovata.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.updateTender(tenderId, tenantId, payload)
  logger.info('Tender updated', { tenderId, tenantId })

  return queries.getTenderById(tenderId, tenantId)
}

async function deleteTender(tenderId, tenantId) {
  const existing = await queries.getTenderById(tenderId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Gara non trovata.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.softDeleteTender(tenderId, tenantId)
  logger.info('Tender deleted', { tenderId, tenantId })
}

async function changeStatus(tenderId, status, tenantId) {
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
}

async function assignTender(tenderId, assignments, tenantId) {
  const existing = await queries.getTenderById(tenderId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Gara non trovata.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.assignUsersToTender(tenderId, assignments)
  logger.info('Tender assigned', { tenderId, tenantId })
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
