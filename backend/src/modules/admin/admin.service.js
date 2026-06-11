import * as queries from './admin.queries.js'
import * as auditService from '../audit/audit.service.js'
import logger from '../../config/logger.js'

async function listTenants(filters, pagination) {
  return queries.getAllTenants(filters, pagination)
}

async function getTenant(tenantId) {
  const tenant = await queries.getTenantDetail(tenantId)
  if (!tenant) {
    throw Object.assign(new Error('Tenant non trovato.'), { statusCode: 404, code: 'NOT_FOUND' })
  }
  return tenant
}

async function setTenantStatus(tenantId, status, blockedReason, adminUserId) {
  const tenant = await queries.getTenantDetail(tenantId)
  if (!tenant) {
    throw Object.assign(new Error('Tenant non trovato.'), { statusCode: 404, code: 'NOT_FOUND' })
  }

  await queries.updateTenantStatus(tenantId, status, blockedReason)

  logger.info('Tenant status updated by admin', { tenantId, status, adminUserId })

  return queries.getTenantDetail(tenantId)
}

async function setTenantPlan(tenantId, planCode, adminUserId) {
  const tenant = await queries.getTenantDetail(tenantId)
  if (!tenant) {
    throw Object.assign(new Error('Tenant non trovato.'), { statusCode: 404, code: 'NOT_FOUND' })
  }

  const plans = await queries.getAllPlans()
  const plan = plans.find(p => p.code === planCode)
  if (!plan) {
    throw Object.assign(new Error('Piano non valido.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
  }

  await queries.updateTenantPlan(tenantId, plan.id)

  logger.info('Tenant plan changed by admin', { tenantId, planCode, adminUserId })

  return queries.getTenantDetail(tenantId)
}

async function updateTenantProfile(tenantId, payload, adminUserId) {
  const tenant = await queries.getTenantDetail(tenantId)
  if (!tenant) {
    throw Object.assign(new Error('Tenant non trovato.'), { statusCode: 404, code: 'NOT_FOUND' })
  }

  const updated = await queries.updateTenant(tenantId, payload)
  if (!updated) {
    throw Object.assign(new Error('Nessun campo da aggiornare.'), { statusCode: 400, code: 'NO_CHANGES' })
  }

  logger.info('Tenant profile updated by admin', { tenantId, adminUserId })
  return queries.getTenantDetail(tenantId)
}

async function listUsers(filters, pagination) {
  return queries.getAllUsers(filters, pagination)
}

async function changeUserRole(userId, roleCode, adminUserId) {
  const success = await queries.setUserRole(userId, roleCode)
  if (!success) {
    throw Object.assign(new Error('Ruolo non valido.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
  }

  logger.info('User role changed by admin', { userId, roleCode, adminUserId })
}

async function listPlans() {
  return queries.getAllPlans()
}

async function createPlan(payload, adminUserId) {
  const plans = await queries.getAllPlans()
  const exists = plans.find(p => p.code === payload.code)
  if (exists) {
    throw Object.assign(new Error('Codice piano già esistente.'), { statusCode: 422, code: 'DUPLICATE' })
  }

  const planId = await queries.createPlan(payload)

  logger.info('Plan created by admin', { planId, code: payload.code, adminUserId })
  return planId
}

async function editPlan(planId, payload, adminUserId) {
  const updated = await queries.updatePlan(planId, payload)
  if (!updated) {
    throw Object.assign(new Error('Piano non trovato o nessuna modifica.'), { statusCode: 404, code: 'NOT_FOUND' })
  }

  logger.info('Plan updated by admin', { planId, adminUserId })
}

async function getUsage(tenantId) {
  return queries.checkTenantLimits(tenantId)
}

export {
  listTenants,
  getTenant,
  setTenantStatus,
  setTenantPlan,
  updateTenantProfile,
  listUsers,
  changeUserRole,
  listPlans,
  createPlan,
  editPlan,
  getUsage,
}
