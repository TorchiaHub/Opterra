import { describe, it, expect } from 'vitest'
import { getTestPool } from './setup.js'

describe('Tenders — queries', () => {

  it('should list tenders by tenant with pagination', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT * FROM tenders WHERE tenant_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [100, 10, 0]
    )
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows[0].title).toBeDefined()
  })

  it('should count tenders per tenant', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total FROM tenders WHERE tenant_id = ? AND deleted_at IS NULL`,
      [100]
    )
    expect(rows[0].total).toBeGreaterThanOrEqual(2)
  })

  it('should filter tenders by status', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT * FROM tenders WHERE tenant_id = ? AND status = ? AND deleted_at IS NULL`,
      [100, 'active']
    )
    expect(rows.length).toBeGreaterThanOrEqual(1)
    expect(rows[0].status).toBe('active')
  })

  it('should search tenders by title', async () => {
    const pool = await getTestPool()
    const [rows] = await pool.query(
      `SELECT * FROM tenders WHERE tenant_id = ? AND title LIKE ? AND deleted_at IS NULL`,
      [100, '%Fornitura%']
    )
    expect(rows.length).toBeGreaterThanOrEqual(1)
  })

  it('should create and soft-delete a tender', async () => {
    const pool = await getTestPool()
    const [users] = await pool.query(
      `SELECT id FROM users WHERE tenant_id = ? LIMIT 1`, [100]
    )
    const [result] = await pool.query(
      `INSERT INTO tenders (tenant_id, title, issuer, description, status, type, publication_date, deadline_at, created_by)
       VALUES (?, ?, 'Test Issuer', 'Descrizione', 'draft', 'tender', CURDATE(), DATE_ADD(NOW(), INTERVAL 30 DAY), ?)`,
      [100, 'Test Tender for Delete', users[0].id]
    )
    const tenderId = result.insertId

    await pool.query(
      `UPDATE tenders SET deleted_at = NOW() WHERE id = ? AND tenant_id = ?`,
      [tenderId, 100]
    )

    const [deleted] = await pool.query(
      `SELECT * FROM tenders WHERE id = ? AND deleted_at IS NULL`,
      [tenderId]
    )
    expect(deleted.length).toBe(0)
  })

  it('should return dashboard KPIs', async () => {
    const pool = await getTestPool()
    const [active] = await pool.query(
      `SELECT COUNT(*) as count FROM tenders WHERE tenant_id = ? AND status = 'active' AND deleted_at IS NULL`,
      [100]
    )
    const [draft] = await pool.query(
      `SELECT COUNT(*) as count FROM tenders WHERE tenant_id = ? AND status = 'draft' AND deleted_at IS NULL`,
      [100]
    )
    const [won] = await pool.query(
      `SELECT COUNT(*) as count FROM tenders WHERE tenant_id = ? AND status = 'won' AND deleted_at IS NULL`,
      [100]
    )

    expect(typeof active[0].count).toBe('number')
    expect(typeof draft[0].count).toBe('number')
    expect(typeof won[0].count).toBe('number')
    expect(active[0].count + draft[0].count + won[0].count).toBeGreaterThanOrEqual(3)
  })
})
