const ALLOWED_TENANT_STATUSES = ['active', 'blocked', 'suspended']
const ALLOWED_ROLES = ['superadmin', 'manager', 'user']

function validateTenantStatus(body) {
  const errors = []
  if (!body.status || !ALLOWED_TENANT_STATUSES.includes(body.status)) {
    errors.push('status deve essere uno tra: active, blocked, suspended')
  }
  if (body.status === 'blocked' && !body.blockedReason) {
    errors.push('blockedReason è obbligatorio quando status è blocked')
  }
  return errors
}

function validatePlan(body) {
  const errors = []
  if (!body.code || typeof body.code !== 'string') errors.push('code obbligatorio')
  if (!body.name || typeof body.name !== 'string') errors.push('name obbligatorio')
  if (!Number.isInteger(body.maxUsers) || body.maxUsers < 1) errors.push('maxUsers deve essere un intero positivo')
  if (!Number.isInteger(body.maxTenders) || body.maxTenders < 1) errors.push('maxTenders deve essere un intero positivo')
  if (!Number.isInteger(body.maxStorageMb) || body.maxStorageMb < 1) errors.push('maxStorageMb deve essere un intero positivo')
  if (!Number.isInteger(body.maxAiRequestsMonth) || body.maxAiRequestsMonth < 0) errors.push('maxAiRequestsMonth deve essere un intero positivo')
  return errors
}

function validateUpdatePlan(body) {
  const errors = []
  if (body.maxUsers !== undefined && (!Number.isInteger(body.maxUsers) || body.maxUsers < 1)) errors.push('maxUsers deve essere un intero positivo')
  if (body.maxTenders !== undefined && (!Number.isInteger(body.maxTenders) || body.maxTenders < 1)) errors.push('maxTenders deve essere un intero positivo')
  if (body.maxStorageMb !== undefined && (!Number.isInteger(body.maxStorageMb) || body.maxStorageMb < 1)) errors.push('maxStorageMb deve essere un intero positivo')
  if (body.maxAiRequestsMonth !== undefined && (!Number.isInteger(body.maxAiRequestsMonth) || body.maxAiRequestsMonth < 0)) errors.push('maxAiRequestsMonth deve essere un intero positivo')
  if (Object.keys(body).length === 0) errors.push('Almeno un campo da aggiornare')
  return errors
}

function validatePlanCode(body) {
  const errors = []
  if (!body.planCode || typeof body.planCode !== 'string') errors.push('planCode obbligatorio')
  return errors
}

function validateRoleCode(body) {
  const errors = []
  if (!body.roleCode || !ALLOWED_ROLES.includes(body.roleCode)) {
    errors.push('roleCode deve essere uno tra: superadmin, manager, user')
  }
  return errors
}

export { validateTenantStatus, validatePlan, validateUpdatePlan, validatePlanCode, validateRoleCode }
