import * as queries from './requirements.queries.js'
import logger from '../../config/logger.js'

async function getRequirements(tenderId, tenantId) {
  return queries.getRequirementsByTender(tenderId, tenantId)
}

async function addRequirement(tenderId, payload, userId, tenantId) {
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
  return queries.getRequirementsByTender(tenderId, tenantId)
}

async function updateItem(itemId, payload, tenantId, userId) {
  const existing = await queries.getRequirementItemById(itemId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Item requisito non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.updateRequirementItem(itemId, tenantId, payload)
  logger.info('Requirement item updated', { itemId, tenantId, userId })
}

async function deleteItem(itemId, tenantId) {
  const existing = await queries.getRequirementItemById(itemId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Item requisito non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  await queries.softDeleteRequirementItem(itemId, tenantId)
  logger.info('Requirement item deleted', { itemId, tenantId })
}

export { getRequirements, addRequirement, updateItem, deleteItem }
