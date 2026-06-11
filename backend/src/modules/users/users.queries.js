import pool from '../../config/db.js'
import crypto from 'crypto'

async function getUsersByTenant(tenantId, filters = {}) {
  let sql = `
    SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name, u.avatar_url,
           u.status, u.last_login_at, u.created_at,
           r.code as role_code
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    WHERE u.tenant_id = ? AND u.deleted_at IS NULL
  `
  const params = [tenantId]

  if (filters.status) {
    sql += ' AND u.status = ?'
    params.push(filters.status)
  }

  if (filters.search) {
    sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)'
    const like = `%${filters.search}%`
    params.push(like, like, like)
  }

  sql += ' ORDER BY u.created_at DESC'

  const [rows] = await pool.query(sql, params)
  return rows
}

async function getUserById(userId, tenantId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name, u.avatar_url,
            u.status, u.last_login_at, u.created_at,
            r.code as role_code
     FROM users u
     JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id
     WHERE u.id = ? AND u.tenant_id = ? AND u.deleted_at IS NULL
     LIMIT 1`,
    [userId, tenantId]
  )
  return rows[0] || null
}

async function updateUserRole(userId, roleCode, tenantId) {
  const [role] = await pool.query(
    'SELECT id FROM roles WHERE code = ? AND scope = ? LIMIT 1',
    [roleCode, 'tenant']
  )
  if (role.length === 0) {
    throw Object.assign(new Error(`Ruolo ${roleCode} non trovato.`), {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
    })
  }

  await pool.query(
    `DELETE FROM user_roles WHERE user_id = ? AND tenant_id = ?`,
    [userId, tenantId]
  )

  await pool.query(
    `INSERT INTO user_roles (user_id, role_id, tenant_id) VALUES (?, ?, ?)`,
    [userId, role[0].id, tenantId]
  )
}

async function softDeleteUser(userId, tenantId) {
  const [result] = await pool.query(
    `UPDATE users SET deleted_at = NOW(), status = 'disabled' WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    [userId, tenantId]
  )
  return result.affectedRows > 0
}

async function createInvitation(payload) {
  const token = crypto.randomBytes(48).toString('hex')
  const [result] = await pool.query(
    `INSERT INTO invitations (tenant_id, email, role_code, token, expires_at, created_by)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?)`,
    [payload.tenantId, payload.email, payload.roleCode, payload.createdBy]
  )
  return {
    id: result.insertId,
    token,
    email: payload.email,
    roleCode: payload.roleCode,
  }
}

async function getGroupsByTenant(tenantId) {
  const [rows] = await pool.query(
    `SELECT g.*, COUNT(gm.id) as member_count
     FROM groups g
     LEFT JOIN group_members gm ON gm.group_id = g.id
     WHERE g.tenant_id = ? AND g.deleted_at IS NULL
     GROUP BY g.id
     ORDER BY g.name ASC`,
    [tenantId]
  )
  return rows
}

async function createGroup(tenantId, name, description) {
  const [result] = await pool.query(
    `INSERT INTO groups (tenant_id, name, description) VALUES (?, ?, ?)`,
    [tenantId, name, description || null]
  )
  return { id: result.insertId, tenantId, name, description }
}

async function addGroupMember(groupId, userId, tenantId) {
  const [existing] = await pool.query(
    `SELECT id FROM group_members WHERE group_id = ? AND user_id = ? LIMIT 1`,
    [groupId, userId]
  )
  if (existing.length > 0) return { alreadyMember: true }

  await pool.query(
    `INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`,
    [groupId, userId]
  )
  return { alreadyMember: false }
}

export {
  getUsersByTenant,
  getUserById,
  updateUserRole,
  softDeleteUser,
  createInvitation,
  getGroupsByTenant,
  createGroup,
  addGroupMember,
}
