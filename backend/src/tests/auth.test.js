import { describe, it, expect } from 'vitest'
import { getTestPool } from './setup.js'

describe('Auth — queries', () => {

  it('should find superadmin user by email globally', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT u.*, r.code as role_code
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       WHERE u.email = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      ['admin@tenderflow.app']
    )
    expect(rows[0]).toBeDefined()
    expect(rows[0].email).toBe('admin@tenderflow.app')
    expect(rows[0].role_code).toBe('superadmin')
  })

  it('should find manager user by email within tenant', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT u.*, r.code as role_code
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       WHERE u.email = ? AND u.tenant_id = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      ['marco@demo.it', 100]
    )
    expect(rows[0]).toBeDefined()
    expect(rows[0].role_code).toBe('manager')
    expect(rows[0].tenant_id).toBe(100)
  })

  it('should have bcrypt password hash stored', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT password_hash FROM users WHERE email = ?`,
      ['marco@demo.it']
    )
    expect(rows[0].password_hash).toMatch(/^\$2b\$/)
  })

  it('should insert and revoke refresh token', async () => {
    const pool = await getTestPool()
    const [user] = await pool.query('SELECT id FROM users LIMIT 1')

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user[0].id, 'test_hash_abc123']
    )

    const [stored] = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()`,
      ['test_hash_abc123']
    )
    expect(stored.length).toBe(1)

    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?`,
      ['test_hash_abc123']
    )

    const [revoked] = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL`,
      ['test_hash_abc123']
    )
    expect(revoked.length).toBe(0)
  })
})

describe('Auth — tenant scoping', () => {

  it('should NOT find cross-tenant user by email within wrong tenant', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT u.* FROM users u
       WHERE u.email = ? AND u.tenant_id = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      ['marco@demo.it', 999]
    )
    expect(rows.length).toBe(0)
  })

  it('should create new tenant with manager role', async () => {
    const pool = await getTestPool()
    const [managerRole] = await pool.query('SELECT id FROM roles WHERE code = ?', ['manager'])

    await pool.query(
      `INSERT INTO tenants (name, slug, status) VALUES (?, ?, 'active')`,
      ['Test Tenant', 'test-tenant-auth']
    )
    const [tenantRows] = await pool.query('SELECT LAST_INSERT_ID() as id')
    const tenantId = tenantRows[0].id

    await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, status)
       VALUES (?, ?, '$2b$12$test', 'Test', 'User', 'active')`,
      [tenantId, 'test@test.it']
    )
    const [userRows] = await pool.query('SELECT LAST_INSERT_ID() as id')
    const userId = userRows[0].id

    await pool.query(
      `INSERT INTO user_roles (user_id, role_id, tenant_id) VALUES (?, ?, ?)`,
      [userId, managerRole[0].id, tenantId]
    )

    const [user] = await pool.query(
      `SELECT r.code as role_code FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       WHERE u.id = ?`,
      [userId]
    )
    expect(user[0].role_code).toBe('manager')
  })
})
