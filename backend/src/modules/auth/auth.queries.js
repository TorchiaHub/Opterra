import pool from '../../config/db.js'

async function createTenantWithManager(payload, trx) {
  const conn = trx || pool
  await conn.query(
    `INSERT INTO tenants (name, slug, vat_number, industry, country, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [payload.name, payload.slug, payload.vatNumber || null, payload.industry || null, payload.country || 'IT']
  )
  const [tenantRows] = await conn.query('SELECT LAST_INSERT_ID() as id')
  const tenantId = tenantRows[0].id

  const passwordHash = payload.passwordHash
  await conn.query(
    `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [tenantId, payload.email, passwordHash, payload.firstName, payload.lastName]
  )
  const [userRows] = await conn.query('SELECT LAST_INSERT_ID() as id')
  const userId = userRows[0].id

  const [managerRole] = await conn.query('SELECT id FROM roles WHERE code = ?', ['manager'])

  if (managerRole.length > 0) {
    await conn.query(
      `INSERT INTO user_roles (user_id, role_id, tenant_id) VALUES (?, ?, ?)`,
      [userId, managerRole[0].id, tenantId]
    )
  }

  const [freePlan] = await conn.query('SELECT id FROM plans WHERE code = ?', ['free'])
  if (freePlan.length > 0) {
    await conn.query(
      `INSERT INTO subscriptions (tenant_id, plan_id, status, starts_at)
       VALUES (?, ?, 'active', NOW())`,
      [tenantId, freePlan[0].id]
    )
  }

  return { tenantId, userId }
}

async function findUserByEmail(email, tenantId) {
  const [rows] = await pool.query(
    `SELECT u.*, r.code as role_code
     FROM users u
     JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id
     WHERE u.email = ? AND u.tenant_id = ? AND u.deleted_at IS NULL
     LIMIT 1`,
    [email, tenantId]
  )
  return rows[0] || null
}

async function findUserByEmailGlobal(email) {
  const [rows] = await pool.query(
    `SELECT u.*, r.code as role_code
     FROM users u
     JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id
     WHERE u.email = ? AND u.deleted_at IS NULL
     LIMIT 1`,
    [email]
  )
  return rows[0] || null
}

async function insertRefreshToken(userId, tokenHash, expiresAt) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  )
}

async function revokeRefreshToken(tokenHash) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL`,
    [tokenHash]
  )
}

async function findRefreshToken(tokenHash) {
  const [rows] = await pool.query(
    `SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1`,
    [tokenHash]
  )
  return rows[0] || null
}

async function updateLastLogin(userId) {
  await pool.query(
    `UPDATE users SET last_login_at = NOW() WHERE id = ?`,
    [userId]
  )
}

async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT u.*, r.code as role_code
     FROM users u
     JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id
     WHERE u.id = ? AND u.deleted_at IS NULL
     LIMIT 1`,
    [id]
  )
  return rows[0] || null
}

async function getTenantBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT * FROM tenants WHERE slug = ? AND deleted_at IS NULL LIMIT 1`,
    [slug]
  )
  return rows[0] || null
}

async function findRevokedRefreshToken(tokenHash) {
  const [rows] = await pool.query(
    `SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NOT NULL LIMIT 1`,
    [tokenHash]
  )
  return rows[0] || null
}

async function revokeAllUserTokens(userId) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  )
}

export {
  createTenantWithManager,
  findUserByEmail,
  findUserByEmailGlobal,
  insertRefreshToken,
  revokeRefreshToken,
  findRefreshToken,
  findRevokedRefreshToken,
  revokeAllUserTokens,
  updateLastLogin,
  getUserById,
  getTenantBySlug,
}
