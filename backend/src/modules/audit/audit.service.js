import * as queries from './audit.queries.js'
import logger from '../../config/logger.js'

async function log(action, entityType, entityId, userId, tenantId, diffJson, req) {
  try {
    await queries.insertAuditLog({
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      diffJson,
      ipAddress: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    })
  } catch (err) {
    logger.error('Audit log insertion failed', { error: err.message, action, entityType })
  }
}

async function getLogs(tenantId, filters, pagination) {
  return queries.getAuditLogsByTenant(tenantId, filters, pagination)
}

async function getExport(tenantId, filters) {
  return queries.getAuditExportByTenant(tenantId, filters)
}

export { log, getLogs, getExport }
