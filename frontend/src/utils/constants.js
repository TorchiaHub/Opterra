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

export const TENDER_STATUS_LABELS = {
  draft: 'Bozza',
  active: 'Attiva',
  in_review: 'In revisione',
  submitted: 'Inviata',
  won: 'Vinta',
  lost: 'Persa',
  cancelled: 'Annullata',
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

export const TENDER_TYPE_LABELS = {
  rfp: 'RFP',
  rfq: 'RFQ',
  tender: 'Gara',
  bando: 'Bando',
}

export const REQUIREMENT_PRIORITY = {
  MANDATORY: 'mandatory',
  IMPORTANT: 'important',
  OPTIONAL: 'optional',
}

export const REQUIREMENT_PRIORITY_LABELS = {
  mandatory: 'Obbligatorio',
  important: 'Importante',
  optional: 'Opzionale',
}

export const REQUIREMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  NOT_APPLICABLE: 'na',
}

export const REQUIREMENT_STATUS_LABELS = {
  pending: 'In attesa',
  in_progress: 'In corso',
  completed: 'Completato',
  na: 'N/A',
}

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  BLOCKED: 'blocked',
}

export const TASK_STATUS_LABELS = {
  todo: 'Da fare',
  in_progress: 'In corso',
  done: 'Completata',
  blocked: 'Bloccata',
}

export const GO_NOGO_DECISIONS = {
  PENDING: 'pending',
  GO: 'go',
  NO_GO: 'no_go',
}

export const GO_NOGO_LABELS = {
  pending: 'Da valutare',
  go: 'Go',
  no_go: 'No-Go',
}

export const SCRAPING_STATUS = {
  NEW: 'new',
  SAVED: 'saved',
  DISMISSED: 'dismissed',
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
