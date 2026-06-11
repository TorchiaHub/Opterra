export const ROLES = {
  SUPERADMIN: 'superadmin',
  MANAGER: 'manager',
  USER: 'user',
}

export const TENDER_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  IN_REVIEW: 'in_review',
  SUBMITTED: 'submitted',
  WON: 'won',
  LOST: 'lost',
  CANCELLED: 'cancelled',
}

export const TENDER_STATUS_COLORS = {
  draft: 'neutral',
  active: 'info',
  in_review: 'warning',
  submitted: 'pending',
  won: 'success',
  lost: 'danger',
  cancelled: 'neutral',
}

export const TENDER_TYPES = {
  RFP: 'rfp',
  RFQ: 'rfq',
  TENDER: 'tender',
  BANDO: 'bando',
}

export const REQUIREMENT_PRIORITY = {
  MANDATORY: 'mandatory',
  IMPORTANT: 'important',
  OPTIONAL: 'optional',
}

export const REQUIREMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  NOT_APPLICABLE: 'na',
}

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  BLOCKED: 'blocked',
}

export const GO_NOGO_DECISIONS = {
  PENDING: 'pending',
  GO: 'go',
  NO_GO: 'no_go',
}

export const SCRAPING_STATUS = {
  NEW: 'new',
  SAVED: 'saved',
  DISMISSED: 'dismissed',
}

export function getStatusLabel(status) {
  return `status.${status}`
}

export function getTenderTypeLabel(type) {
  return `tenderTypes.${type}`
}

export const APP_ROUTES = {
  HOME: '/',
  FEATURES: '/features',
  PRICING: '/pricing',
  DEMO: '/demo',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/app/dashboard',
  TENDERS: '/app/tenders',
  TENDER_DETAIL: '/app/tenders/:id',
  USERS: '/app/users',
  AUDIT: '/app/audit',
  DISCOVERY: '/app/discovery',
  SETTINGS: '/app/settings',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_TENANTS: '/admin/tenants',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_AUDIT: '/admin/audit',
}