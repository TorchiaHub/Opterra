import * as queries from './tenants.queries.js'
import logger from '../../config/logger.js'

async function getProfile(tenantId) {
  const tenant = await queries.getTenantById(tenantId)
  if (!tenant) {
    throw Object.assign(new Error('Tenant non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }
  return tenant
}

async function updateProfile(tenantId, payload) {
  const updated = await queries.updateTenant(tenantId, payload)
  if (!updated) {
    throw Object.assign(new Error('Tenant non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  logger.info('Tenant profile updated', { tenantId })
  return queries.getTenantById(tenantId)
}

export { getProfile, updateProfile }
