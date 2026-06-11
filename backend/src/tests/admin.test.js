import { describe, it, expect } from 'vitest'
import { getTestPool } from './setup.js'

describe('Admin — queries', () => {

  it('should list all tenants with plan info', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT t.*, p.name as plan_name, p.code as plan_code
       FROM tenants t
       LEFT JOIN subscriptions s ON s.tenant_id = t.id AND s.status = 'active'
       LEFT JOIN plans p ON p.id = s.plan_id
       WHERE t.deleted_at IS NULL
       ORDER BY t.created_at DESC`
    )
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows.some(r => r.plan_code === 'free')).toBe(true)
    expect(rows.some(r => r.slug === 'demo-azienda')).toBe(true)
  })

  it('should get tenant detail with user and tender counts', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT t.id,
              (SELECT COUNT(*) FROM users WHERE tenant_id = t.id AND deleted_at IS NULL) as user_count,
              (SELECT COUNT(*) FROM tenders WHERE tenant_id = t.id AND deleted_at IS NULL) as tender_count
       FROM tenants t
       WHERE t.id = ? AND t.deleted_at IS NULL
       LIMIT 1`,
      [100]
    )
    expect(rows[0].user_count).toBeGreaterThanOrEqual(2)
    expect(rows[0].tender_count).toBeGreaterThanOrEqual(3)
  })

  it('should update tenant status', async () => {
    const pool = await getTestPool()
    await pool.query(
      `UPDATE tenants SET status = 'blocked', blocked_reason = 'Test block' WHERE id = ?`,
      [100]
    )

    const [blocked] = await pool.query(
      `SELECT status, blocked_reason FROM tenants WHERE id = ?`, [100]
    )
    expect(blocked[0].status).toBe('blocked')
    expect(blocked[0].blocked_reason).toBe('Test block')

    await pool.query(
      `UPDATE tenants SET status = 'active', blocked_reason = NULL WHERE id = ?`, [100]
    )
  })

  it('should change tenant plan', async () => {
    const pool = await getTestPool()
    const [plan] = await pool.query(`SELECT id FROM plans WHERE code = 'pro'`)

    const [existing] = await pool.query(
      `SELECT id FROM subscriptions WHERE tenant_id = ? AND status = 'active' LIMIT 1`,
      [100]
    )

    if (existing.length > 0) {
      await pool.query(`UPDATE subscriptions SET plan_id = ? WHERE id = ?`, [plan[0].id, existing[0].id])
    }

    const [sub] = await pool.query(
      `SELECT p.code FROM subscriptions s JOIN plans p ON p.id = s.plan_id WHERE s.tenant_id = ? AND s.status = 'active'`,
      [100]
    )
    expect(sub[0].code).toBe('pro')
  })

  it('should list all users with tenant info', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT u.*, r.code as role_code, t.name as tenant_name
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       JOIN tenants t ON t.id = u.tenant_id
       WHERE u.deleted_at IS NULL
       ORDER BY u.created_at DESC`
    )
    expect(rows.length).toBeGreaterThanOrEqual(3)
    expect(rows.some(r => r.role_code === 'superadmin')).toBe(true)
    expect(rows.some(r => r.role_code === 'manager')).toBe(true)
  })

  it('should change user role', async () => {
    const pool = await getTestPool()
    const [role] = await pool.query(`SELECT id FROM roles WHERE code = 'manager'`)
    const [userRows] = await pool.query(`SELECT id FROM users WHERE tenant_id = 100 LIMIT 1`)
    const userId = userRows[0].id

    await pool.query(`DELETE FROM user_roles WHERE user_id = ?`, [userId])
    await pool.query(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, role[0].id])

    const [updated] = await pool.query(
      `SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ?`,
      [userId]
    )
    expect(updated[0].code).toBe('manager')
  })

  it('should list all plans sorted by users', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(`SELECT * FROM plans ORDER BY max_users ASC`)

    expect(rows.length).toBeGreaterThanOrEqual(3)
    expect(rows[0].code).toBe('free')
    expect(rows[rows.length - 1].code).toBe('enterprise')
  })

  it('should return tenant usage limits', async () => {
    const pool = await getTestPool()
    const [sub] = await pool.query(
      `SELECT p.max_users, p.max_tenders, p.max_storage_mb
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.tenant_id = ? AND s.status = 'active'
       LIMIT 1`,
      [100]
    )

    const [userCount] = await pool.query(
      `SELECT COUNT(*) as count FROM users WHERE tenant_id = ? AND deleted_at IS NULL`,
      [100]
    )
    const [tenderCount] = await pool.query(
      `SELECT COUNT(*) as count FROM tenders WHERE tenant_id = ? AND deleted_at IS NULL`,
      [100]
    )

    expect(sub[0].max_users).toBeGreaterThanOrEqual(userCount[0].count)
    expect(sub[0].max_tenders).toBeGreaterThanOrEqual(tenderCount[0].count)
    expect(sub[0].max_storage_mb).toBeGreaterThan(0)
  })
})
