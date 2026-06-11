import pool from '../../config/db.js'

async function insertAuditLog(payload) {
  const [result] = await pool.query(
    `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, diff_json, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [payload.tenantId || null, payload.userId || null, payload.action,
     payload.entityType, payload.entityId || null,
     payload.diffJson ? JSON.stringify(payload.diffJson) : null,
     payload.ipAddress || null, payload.userAgent || null]
  )
  return result.insertId
}

async function getAuditLogsByTenant(tenantId, filters = {}, pagination = {}) {
  let sql = `SELECT al.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
             FROM audit_logs al
             LEFT JOIN users u ON u.id = al.user_id
             WHERE al.tenant_id = ?`
  const params = [tenantId]

  if (filters.action) {
    sql += ' AND al.action = ?'
    params.push(filters.action)
  }

  if (filters.entityType) {
    sql += ' AND al.entity_type = ?'
    params.push(filters.entityType)
  }

  if (filters.from) {
    sql += ' AND al.created_at >= ?'
    params.push(filters.from)
  }

  if (filters.to) {
    sql += ' AND al.created_at <= ?'
    params.push(filters.to)
  }

  sql += ' ORDER BY al.created_at DESC'

  const page = Math.max(1, parseInt(pagination.page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(pagination.pageSize, 10) || 50))
  const offset = (page - 1) * pageSize

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM audit_logs WHERE tenant_id = ?`,
    [tenantId]
  )

  sql += ' LIMIT ? OFFSET ?'
  params.push(pageSize, offset)

  const [rows] = await pool.query(sql, params)

  return {
    data: rows,
    meta: { page, pageSize, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / pageSize) },
  }
}

async function getGlobalAuditLogs(filters = {}, pagination = {}) {
  let sql = `SELECT al.*, CONCAT(u.first_name, ' ', u.last_name) as user_name, t.name as tenant_name
             FROM audit_logs al
             LEFT JOIN users u ON u.id = al.user_id
             LEFT JOIN tenants t ON t.id = al.tenant_id
             WHERE 1=1`
  const params = []

  if (filters.tenantId) {
    sql += ' AND al.tenant_id = ?'
    params.push(filters.tenantId)
  }

  if (filters.action) {
    sql += ' AND al.action = ?'
    params.push(filters.action)
  }

  sql += ' ORDER BY al.created_at DESC'

  const page = Math.max(1, parseInt(pagination.page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(pagination.pageSize, 10) || 50))
  const offset = (page - 1) * pageSize

  sql += ' LIMIT ? OFFSET ?'
  params.push(pageSize, offset)

  const [rows] = await pool.query(sql, params)
  return { data: rows, meta: { page, pageSize } }
}

async function getAuditExportByTenant(tenantId, filters = {}) {
  let sql = `SELECT al.created_at, al.action, al.entity_type, al.entity_id,
                    CONCAT(u.first_name, ' ', u.last_name) as user_name
             FROM audit_logs al
             LEFT JOIN users u ON u.id = al.user_id
             WHERE al.tenant_id = ?`
  const params = [tenantId]

  if (filters.from) {
    sql += ' AND al.created_at >= ?'
    params.push(filters.from)
  }

  if (filters.to) {
    sql += ' AND al.created_at <= ?'
    params.push(filters.to)
  }

  sql += ' ORDER BY al.created_at DESC'

  const [rows] = await pool.query(sql, params)
  return rows
}

export { insertAuditLog, getAuditLogsByTenant, getGlobalAuditLogs, getAuditExportByTenant }
