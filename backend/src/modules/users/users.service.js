import * as queries from './users.queries.js'
import logger from '../../config/logger.js'
import { log as auditLog } from '../audit/audit.service.js'

async function listUsers(tenantId, filters) {
  return queries.getUsersByTenant(tenantId, filters)
}

async function getUserDetail(userId, tenantId) {
  const user = await queries.getUserById(userId, tenantId)
  if (!user) {
    throw Object.assign(new Error('Utente non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }
  return user
}

async function changeRole(userId, roleCode, actorId, tenantId, req) {
  const target = await queries.getUserById(userId, tenantId)
  if (!target) {
    throw Object.assign(new Error('Utente non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  if (target.role_code === 'superadmin') {
    throw Object.assign(new Error('Non puoi modificare il ruolo del superadmin.'), {
      statusCode: 403,
      code: 'FORBIDDEN',
    })
  }

  await queries.updateUserRole(userId, roleCode, tenantId)
  logger.info('User role updated', { userId, roleCode, actorId, tenantId })
  auditLog('user.role_changed', 'user', userId, actorId, tenantId, { from: target.role_code, to: roleCode }, req)
}

async function removeUser(userId, actorId, tenantId, req) {
  const target = await queries.getUserById(userId, tenantId)
  if (!target) {
    throw Object.assign(new Error('Utente non trovato.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  }

  if (target.role_code === 'superadmin' || target.role_code === 'manager') {
    throw Object.assign(new Error('Non puoi rimuovere manager o superadmin.'), {
      statusCode: 403,
      code: 'FORBIDDEN',
    })
  }

  const deleted = await queries.softDeleteUser(userId, tenantId)
  if (deleted) {
    logger.info('User removed', { userId, actorId, tenantId })
    auditLog('user.removed', 'user', userId, actorId, tenantId, null, req)
  }
}

async function inviteUser(tenantId, email, roleCode, createdBy, req) {
  const result = await queries.createInvitation({
    tenantId,
    email,
    roleCode,
    createdBy,
  })
  logger.info('User invited', { email, roleCode, tenantId, invitedBy: createdBy })
  auditLog('user.invited', 'invitation', result.id, createdBy, tenantId, { email, roleCode }, req)
  return result
}

async function listGroups(tenantId) {
  return queries.getGroupsByTenant(tenantId)
}

async function createGroup(tenantId, name, description) {
  const group = await queries.createGroup(tenantId, name, description)
  logger.info('Group created', { groupId: group.id, tenantId })
  return group
}

async function addMemberToGroup(groupId, userId, tenantId) {
  const result = await queries.addGroupMember(groupId, userId, tenantId)
  if (result.alreadyMember) {
    throw Object.assign(new Error('Utente già membro del gruppo.'), {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
    })
  }
  logger.info('Member added to group', { groupId, userId, tenantId })
}

export {
  listUsers,
  getUserDetail,
  changeRole,
  removeUser,
  inviteUser,
  listGroups,
  createGroup,
  addMemberToGroup,
}
