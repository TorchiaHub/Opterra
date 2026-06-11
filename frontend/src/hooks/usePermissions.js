import { useMemo } from 'react'
import { useAuth } from './useAuth'
import {
  canManageTenders,
  canManageUsers,
  canViewAudit,
  isSuperadmin,
  canDelete,
} from '../utils/guards'

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role

  return useMemo(() => ({
    canManageTenders: canManageTenders(role),
    canManageUsers: canManageUsers(role),
    canViewAudit: canViewAudit(role),
    isSuperadmin: isSuperadmin(role),
    canDelete: canDelete(role),
  }), [role])
}
