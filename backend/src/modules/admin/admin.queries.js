import pool from '../../config/db.js'

async function getAllTenants(filters = {}, pagination = {}) {
  let sql = `SELECT t.*, p.name as plan_name, p.code as plan_code,
             (SELECT COUNT(*) FROM users WHERE tenant_id = t.id AND deleted_at IS NULL) as user_count,
             (SELECT COUNT(*) FROM tenders WHERE tenant_id = t.id AND deleted_at IS NULL) as tender_count
             FROM tenants t
             LEFT JOIN subscriptions s ON s.tenant_id = t.id AND s.status = 'active'
             LEFT JOIN plans p ON p.id = s.plan_id
             WHERE t.deleted_at IS NULL`
  const params = []

  if (filters.search) {
    sql += ' AND (t.name LIKE ? OR t.slug LIKE ? OR t.vat_number LIKE ?)'
    const like = `%${filters.search}%`
    params.push(like, like, like)
  }

  if (filters.status) {
    sql += ' AND t.status = ?'
    params.push(filters.status)
  }

  sql += ' ORDER BY t.created_at DESC'

  const page = Math.max(1, parseInt(pagination.page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(pagination.pageSize, 10) || 20))
  const offset = (page - 1) * pageSize

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM tenants WHERE deleted_at IS NULL`,
    []
  )

  sql += ' LIMIT ? OFFSET ?'
  params.push(pageSize, offset)

  const [rows] = await pool.query(sql, params)
  return {
    data: rows,
    meta: { page, pageSize, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / pageSize) },
  }
}

async function getTenantDetail(tenantId) {
  const [rows] = await pool.query(
    `SELECT t.*, p.name as plan_name, p.code as plan_code, p.max_users, p.max_tenders,
            p.max_storage_mb, p.max_ai_requests_month,
            s.id as subscription_id, s.status as subscription_status,
            s.starts_at, s.ends_at, s.trial_ends_at, s.auto_renew,
            (SELECT COUNT(*) FROM users WHERE tenant_id = t.id AND deleted_at IS NULL) as user_count,
            (SELECT COUNT(*) FROM tenders WHERE tenant_id = t.id AND deleted_at IS NULL) as tender_count
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id AND s.status = 'active'
     LEFT JOIN plans p ON p.id = s.plan_id
     WHERE t.id = ? AND t.deleted_at IS NULL
     LIMIT 1`,
    [tenantId]
  )
  return rows[0] || null
}

async function updateTenantStatus(tenantId, status, blockedReason) {
  const params = [status]
  if (blockedReason !== undefined) {
    params.push(blockedReason)
  }
  params.push(tenantId)

  const setClause = blockedReason !== undefined
    ? 'status = ?, blocked_reason = ?'
    : 'status = ?'

  await pool.query(
    `UPDATE tenants SET ${setClause} WHERE id = ? AND deleted_at IS NULL`,
    params
  )
}

async function updateTenantPlan(tenantId, planId) {
  const [existing] = await pool.query(
    `SELECT id FROM subscriptions WHERE tenant_id = ? AND status = 'active' LIMIT 1`,
    [tenantId]
  )

  if (existing.length > 0) {
    await pool.query(
      `UPDATE subscriptions SET plan_id = ?, updated_at = NOW() WHERE id = ?`,
      [planId, existing[0].id]
    )
  } else {
    await pool.query(
      `INSERT INTO subscriptions (tenant_id, plan_id, status, starts_at) VALUES (?, ?, 'active', NOW())`,
      [tenantId, planId]
    )
  }
}

async function updateTenant(tenantId, payload) {
  const fields = []
  const values = []

  if (payload.name !== undefined) { fields.push('name = ?'); values.push(payload.name) }
  if (payload.slug !== undefined) { fields.push('slug = ?'); values.push(payload.slug) }
  if (payload.vatNumber !== undefined) { fields.push('vat_number = ?'); values.push(payload.vatNumber) }
  if (payload.industry !== undefined) { fields.push('industry = ?'); values.push(payload.industry) }
  if (payload.country !== undefined) { fields.push('country = ?'); values.push(payload.country) }

  if (fields.length === 0) return false

  values.push(tenantId)
  const [result] = await pool.query(
    `UPDATE tenants SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
    values
  )
  return result.affectedRows > 0
}

async function getAllUsers(filters = {}, pagination = {}) {
  let sql = `SELECT u.*, r.code as role_code, t.name as tenant_name, t.slug as tenant_slug
             FROM users u
             JOIN user_roles ur ON ur.user_id = u.id
             JOIN roles r ON r.id = ur.role_id
             JOIN tenants t ON t.id = u.tenant_id
             WHERE u.deleted_at IS NULL`
  const params = []

  if (filters.tenantId) {
    sql += ' AND u.tenant_id = ?'
    params.push(filters.tenantId)
  }

  if (filters.search) {
    sql += ' AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)'
    const like = `%${filters.search}%`
    params.push(like, like, like)
  }

  if (filters.role) {
    sql += ' AND r.code = ?'
    params.push(filters.role)
  }

  sql += ' ORDER BY u.created_at DESC'

  const page = Math.max(1, parseInt(pagination.page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(pagination.pageSize, 10) || 20))
  const offset = (page - 1) * pageSize

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL`,
    []
  )

  sql += ' LIMIT ? OFFSET ?'
  params.push(pageSize, offset)

  const [rows] = await pool.query(sql, params)
  return {
    data: rows,
    meta: { page, pageSize, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / pageSize) },
  }
}

async function setUserRole(userId, roleCode) {
  const [role] = await pool.query('SELECT id FROM roles WHERE code = ?', [roleCode])
  if (role.length === 0) return false

  await pool.query('DELETE FROM user_roles WHERE user_id = ?', [userId])
  await pool.query(
    'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
    [userId, role[0].id]
  )
  return true
}

async function getAllPlans() {
  const [rows] = await pool.query('SELECT * FROM plans ORDER BY max_users ASC')
  return rows
}

async function createPlan(payload) {
  const [result] = await pool.query(
    `INSERT INTO plans (code, name, max_users, max_tenders, max_storage_mb, max_ai_requests_month)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payload.code, payload.name, payload.maxUsers, payload.maxTenders, payload.maxStorageMb, payload.maxAiRequestsMonth]
  )
  return result.insertId
}

async function updatePlan(planId, payload) {
  const fields = []
  const values = []

  if (payload.name !== undefined) { fields.push('name = ?'); values.push(payload.name) }
  if (payload.maxUsers !== undefined) { fields.push('max_users = ?'); values.push(payload.maxUsers) }
  if (payload.maxTenders !== undefined) { fields.push('max_tenders = ?'); values.push(payload.maxTenders) }
  if (payload.maxStorageMb !== undefined) { fields.push('max_storage_mb = ?'); values.push(payload.maxStorageMb) }
  if (payload.maxAiRequestsMonth !== undefined) { fields.push('max_ai_requests_month = ?'); values.push(payload.maxAiRequestsMonth) }

  if (fields.length === 0) return false

  values.push(planId)
  const [result] = await pool.query(
    `UPDATE plans SET ${fields.join(', ')} WHERE id = ?`,
    values
  )
  return result.affectedRows > 0
}

async function getTenantSubscription(tenantId) {
  const [rows] = await pool.query(
    `SELECT s.*, p.code as plan_code, p.name as plan_name,
            p.max_users, p.max_tenders, p.max_storage_mb, p.max_ai_requests_month
     FROM subscriptions s
     JOIN plans p ON p.id = s.plan_id
     WHERE s.tenant_id = ? AND s.status = 'active'
     LIMIT 1`,
    [tenantId]
  )
  return rows[0] || null
}

async function checkTenantLimits(tenantId) {
  const sub = await getTenantSubscription(tenantId)
  if (!sub) return { ok: false, reason: 'Nessun piano attivo' }

  const [userCount] = await pool.query(
    'SELECT COUNT(*) as count FROM users WHERE tenant_id = ? AND deleted_at IS NULL',
    [tenantId]
  )
  const [tenderCount] = await pool.query(
    'SELECT COUNT(*) as count FROM tenders WHERE tenant_id = ? AND deleted_at IS NULL',
    [tenantId]
  )
  const [storageUsed] = await pool.query(
    'SELECT COALESCE(SUM(file_size), 0) as total FROM documents WHERE tenant_id = ? AND deleted_at IS NULL',
    [tenantId]
  )

  return {
    ok: true,
    plan: sub.plan_code,
    limits: {
      users: { current: userCount[0].count, max: sub.max_users },
      tenders: { current: tenderCount[0].count, max: sub.max_tenders },
      storageMb: { current: Math.round(storageUsed[0].total / (1024 * 1024)), max: sub.max_storage_mb },
      aiRequests: { max: sub.max_ai_requests_month },
    },
  }
}

export {
  getAllTenants,
  getTenantDetail,
  updateTenantStatus,
  updateTenantPlan,
  updateTenant,
  getAllUsers,
  setUserRole,
  getAllPlans,
  createPlan,
  updatePlan,
  getTenantSubscription,
  checkTenantLimits,
}
