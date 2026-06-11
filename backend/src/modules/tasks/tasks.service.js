import * as queries from './tasks.queries.js'
import logger from '../../config/logger.js'

async function listTasks(tenderId, tenantId) {
  return queries.getTasksByTender(tenderId, tenantId)
}

async function getTaskDetail(taskId, tenantId) {
  const task = await queries.getTaskById(taskId, tenantId)
  if (!task) {
    throw Object.assign(new Error('Task non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }
  return task
}

async function createTask(tenderId, payload, userId, tenantId) {
  const taskId = await queries.createTask({
    tenantId,
    tenderId,
    title: payload.title,
    description: payload.description,
    status: payload.status || 'todo',
    priority: payload.priority || 'medium',
    dueAt: payload.dueAt,
    assignedUserId: payload.assignedUserId,
    assignedGroupId: payload.assignedGroupId,
    createdBy: userId,
  })

  logger.info('Task created', { taskId, tenderId, tenantId, userId })
  return queries.getTaskById(taskId, tenantId)
}

async function updateTask(taskId, payload, tenantId, userId) {
  const existing = await queries.getTaskById(taskId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Task non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }

  await queries.updateTask(taskId, tenantId, payload)
  logger.info('Task updated', { taskId, tenantId, userId })
  return queries.getTaskById(taskId, tenantId)
}

async function deleteTask(taskId, tenantId) {
  const existing = await queries.getTaskById(taskId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Task non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }

  await queries.softDeleteTask(taskId, tenantId)
  logger.info('Task deleted', { taskId, tenantId })
}

async function addComment(taskId, body, userId, tenantId) {
  const existing = await queries.getTaskById(taskId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Task non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }

  await queries.createTaskComment({ tenantId, taskId, userId, body })
  logger.info('Comment added to task', { taskId, userId, tenantId })
}

async function getComments(taskId, tenantId) {
  return queries.getTaskComments(taskId, tenantId)
}

async function createApproval(taskId, steps, tenantId) {
  const existing = await queries.getTaskById(taskId, tenantId)
  if (!existing) {
    throw Object.assign(new Error('Task non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }

  const approvalId = await queries.createApprovalFlow({ tenantId, taskId, steps })
  logger.info('Approval flow created', { approvalId, taskId, tenantId })
  return queries.getApprovalFlow(taskId, tenantId)
}

async function getApproval(taskId, tenantId) {
  return queries.getApprovalFlow(taskId, tenantId)
}

async function approveStep(stepId, userId, tenantId) {
  const success = await queries.approveStep(stepId, userId, tenantId)
  if (!success) {
    throw Object.assign(new Error('Impossibile approvare. Step non trovato o già processato.'), {
      statusCode: 422, code: 'VALIDATION_ERROR',
    })
  }
  logger.info('Step approved', { stepId, userId, tenantId })
}

async function rejectStep(stepId, userId, tenantId, note) {
  const success = await queries.rejectStep(stepId, userId, tenantId, note)
  if (!success) {
    throw Object.assign(new Error('Impossibile rifiutare. Step non trovato o già processato.'), {
      statusCode: 422, code: 'VALIDATION_ERROR',
    })
  }
  logger.info('Step rejected', { stepId, userId, tenantId })
}

export {
  listTasks, getTaskDetail, createTask, updateTask, deleteTask,
  addComment, getComments,
  createApproval, getApproval, approveStep, rejectStep,
}
