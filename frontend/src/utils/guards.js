import { ROLES } from './constants'

export function canManageTenders(role) {
  return role === ROLES.MANAGER || role === ROLES.SUPERADMIN
}

export function canManageUsers(role) {
  return role === ROLES.MANAGER || role === ROLES.SUPERADMIN
}

export function canViewAudit(role) {
  return role === ROLES.MANAGER || role === ROLES.SUPERADMIN
}

export function isSuperadmin(role) {
  return role === ROLES.SUPERADMIN
}

export function canDelete(role) {
  return role === ROLES.MANAGER || role === ROLES.SUPERADMIN
}

export function canAssignTenders(role) {
  return role === ROLES.MANAGER || role === ROLES.SUPERADMIN
}
