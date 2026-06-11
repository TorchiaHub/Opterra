import * as queries from './requirements.queries.js'
import logger from '../../config/logger.js'
import { log as auditLog } from '../audit/audit.service.js'

async function getRequirements(tenderId, tenantId) {
  return queries.getRequirementsByTender(tenderId, tenantId)
}

async function addRequirement(tenderId, payload, userId, tenantId, req) {
  const requirementId = await queries.insertRequirement({
    tenantId,
    tenderId,
    title: payload.title,
    source: payload.source || 'manual',
    createdBy: userId,
  })

  if (payload.items && payload.items.length > 0) {
    const items = payload.items.map(item => ({
      tenantId,
      tenderId,
      requirementId,
      label: item.label,
      description: item.description,
      itemType: item.itemType,
      priority: item.priority,
    }))
    await queries.insertRequirementItems(items)
  }

  logger.info('Requirement added', { requirementId, tenderId, tenantId, userId })
  auditLog('requirement.created', 'requirement', requirementId, userId, tenantId, { title: payload.title }, req)
  return queries.getRequirementsByTender(tenderId, tenantId)
}

async function updateItem(itemId, payload, tenantId, userId, req) {
  const existing = await queries.getRequirementItemById(itemId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Item requisito non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.updateRequirementItem(itemId, tenantId, payload)
  logger.info('Requirement item updated', { itemId, tenantId, userId })
  auditLog('requirement_item.updated', 'requirement_item', itemId, userId, tenantId, { changes: Object.keys(payload) }, req)
}

async function deleteItem(itemId, tenantId, userId, req) {
  const existing = await queries.getRequirementItemById(itemId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Item requisito non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.softDeleteRequirementItem(itemId, tenantId)
  logger.info('Requirement item deleted', { itemId, tenantId })
  auditLog('requirement_item.deleted', 'requirement_item', itemId, userId, tenantId, null, req)
}

export { getRequirements, addRequirement, updateItem, deleteItem }
