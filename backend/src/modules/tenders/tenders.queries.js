import pool from '../../config/db.js'

async function getTendersByTenant(tenantId, filters = {}, pagination = {}) {
  let sql = `
    SELECT t.*,
           (SELECT COUNT(*) FROM tender_assignments ta WHERE ta.tender_id = t.id) as assignments_count,
           (SELECT COUNT(*) FROM requirement_items ri WHERE ri.tender_id = t.id AND ri.deleted_at IS NULL) as requirements_count,
           (SELECT COUNT(*) FROM requirement_items ri WHERE ri.tender_id = t.id AND ri.status = 'completed' AND ri.deleted_at IS NULL) as completed_requirements
    FROM tenders t
    WHERE t.tenant_id = ? AND t.deleted_at IS NULL
  `
  const params = [tenantId]

  if (filters.status) {
    sql += ' AND t.status = ?'
    params.push(filters.status)
  }

  if (filters.type) {
    sql += ' AND t.type = ?'
    params.push(filters.type)
  }

  if (filters.search) {
    sql += ' AND (t.title LIKE ? OR t.issuer LIKE ? OR t.reference_code LIKE ?)'
    const like = `%${filters.search}%`
    params.push(like, like, like)
  }

  if (filters.from) {
    sql += ' AND t.deadline_at >= ?'
    params.push(filters.from)
  }

  if (filters.to) {
    sql += ' AND t.deadline_at <= ?'
    params.push(filters.to)
  }

  const allowedSort = ['deadline_at', 'created_at', 'title', 'status', 'value_amount']
  const sortBy = allowedSort.includes(filters.sortBy) ? filters.sortBy : 'created_at'
  const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC'
  sql += ` ORDER BY t.${sortBy} ${sortOrder}`

  const page = Math.max(1, parseInt(pagination.page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(pagination.pageSize, 10) || 20))
  const offset = (page - 1) * pageSize

  const countSql = `SELECT COUNT(*) as total FROM tenders t WHERE t.tenant_id = ? AND t.deleted_at IS NULL`
  const [countRows] = await pool.query(countSql, [tenantId])

  sql += ' LIMIT ? OFFSET ?'
  params.push(pageSize, offset)

  const [rows] = await pool.query(sql, params)

  return {
    data: rows,
    meta: {
      page,
      pageSize,
      total: countRows[0].total,
      totalPages: Math.ceil(countRows[0].total / pageSize),
    },
  }
}

async function getTenderById(tenderId, tenantId) {
  const [rows] = await pool.query(
    `SELECT t.*,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ta.id, 'userId', ta.user_id, 'groupId', ta.group_id, 'type', ta.assignment_type))
             FROM tender_assignments ta WHERE ta.tender_id = t.id) as assignments,
            (SELECT COUNT(*) FROM requirement_items ri WHERE ri.tender_id = t.id AND ri.status = 'completed' AND ri.deleted_at IS NULL) as completed_requirements,
            (SELECT COUNT(*) FROM requirement_items ri WHERE ri.tender_id = t.id AND ri.deleted_at IS NULL) as total_requirements
     FROM tenders t
     WHERE t.id = ? AND t.tenant_id = ? AND t.deleted_at IS NULL
     LIMIT 1`,
    [tenderId, tenantId]
  )
  return rows[0] || null
}

async function insertTender(payload) {
  const [result] = await pool.query(
    `INSERT INTO tenders (tenant_id, title, issuer, type, reference_code, description,
      value_amount, currency, publication_date, deadline_at, status, source_type, source_url, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.tenantId, payload.title, payload.issuer, payload.type || 'tender',
      payload.referenceCode || null, payload.description || null,
      payload.valueAmount || null, payload.currency || 'EUR',
      payload.publicationDate || null, payload.deadlineAt,
      payload.status || 'draft', payload.sourceType || 'manual',
      payload.sourceUrl || null, payload.createdBy,
    ]
  )
  return result.insertId
}

async function updateTender(tenderId, tenantId, payload) {
  const fields = []
  const values = []

  const allowed = ['title', 'issuer', 'type', 'reference_code', 'description',
    'value_amount', 'currency', 'publication_date', 'deadline_at', 'source_type', 'source_url']

  const mapping = {
    title: 'title', issuer: 'issuer', type: 'type',
    referenceCode: 'reference_code', description: 'description',
    valueAmount: 'value_amount', currency: 'currency',
    publicationDate: 'publication_date', deadlineAt: 'deadline_at',
    sourceType: 'source_type', sourceUrl: 'source_url',
  }

  for (const [key, column] of Object.entries(mapping)) {
    if (payload[key] !== undefined) {
      fields.push(`${column} = ?`)
      values.push(payload[key])
    }
  }

  if (fields.length === 0) return null

  values.push(tenderId, tenantId)
  const [result] = await pool.query(
    `UPDATE tenders SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    values
  )
  return result.affectedRows > 0
}

async function softDeleteTender(tenderId, tenantId) {
  const [result] = await pool.query(
    `UPDATE tenders SET deleted_at = NOW() WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    [tenderId, tenantId]
  )
  return result.affectedRows > 0
}

async function updateTenderStatus(tenderId, tenantId, status) {
  const [result] = await pool.query(
    `UPDATE tenders SET status = ? WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    [status, tenderId, tenantId]
  )
  return result.affectedRows > 0
}

async function assignUsersToTender(tenderId, assignments) {
  for (const a of assignments) {
    await pool.query(
      `INSERT INTO tender_assignments (tender_id, user_id, group_id, assignment_type)
       VALUES (?, ?, ?, ?)`,
      [tenderId, a.userId || null, a.groupId || null, a.assignmentType || 'contributor']
    )
  }
}

async function getTenderDashboardStats(tenantId) {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
       SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
       SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won,
       SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
       SUM(CASE WHEN deadline_at < NOW() AND status IN ('draft','active') THEN 1 ELSE 0 END) as overdue,
       COALESCE(SUM(value_amount), 0) as total_value,
       COALESCE(SUM(CASE WHEN status = 'won' THEN value_amount ELSE 0 END), 0) as won_value
     FROM tenders
     WHERE tenant_id = ? AND deleted_at IS NULL`,
    [tenantId]
  )
  return rows[0]
}

export {
  getTendersByTenant,
  getTenderById,
  insertTender,
  updateTender,
  softDeleteTender,
  updateTenderStatus,
  assignUsersToTender,
  getTenderDashboardStats,
}
