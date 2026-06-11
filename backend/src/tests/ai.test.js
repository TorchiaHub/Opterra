import { describe, it, expect } from 'vitest'
import { getTestPool } from './setup.js'

describe('AI — queries', () => {

  it('should log an AI request', async () => {
    const pool = await getTestPool()
    const [result] = await pool.query(
      `INSERT INTO ai_requests (tenant_id, user_id, tender_id, request_type, model_name, prompt_tokens, completion_tokens, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [100, 100, 100, 'extract-requirements', 'gpt-4o', 150, 200, 'success']
    )
    expect(result.insertId).toBeGreaterThan(0)
  })

  it('should count monthly AI usage for a tenant', async () => {
    const pool = await getTestPool()
    const yearMonth = new Date().toISOString().slice(0, 7)

    const [rows] = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(prompt_tokens + completion_tokens), 0) as total_tokens
       FROM ai_requests
       WHERE tenant_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ? AND status = 'success'`,
      [100, yearMonth]
    )
    expect(rows[0].count).toBeGreaterThanOrEqual(1)
    expect(typeof rows[0].total_tokens).toBe('number')
  })

  it('should return different counts for different tenants', async () => {
    const pool = await getTestPool()
    const yearMonth = new Date().toISOString().slice(0, 7)

    const [tenant100] = await pool.query(
      `SELECT COUNT(*) as count FROM ai_requests WHERE tenant_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?`,
      [100, yearMonth]
    )
    const [tenant999] = await pool.query(
      `SELECT COUNT(*) as count FROM ai_requests WHERE tenant_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?`,
      [999, yearMonth]
    )
    expect(typeof tenant100[0].count).toBe('number')
    expect(tenant999[0].count).toBe(0)
  })

  it('should record AI error status', async () => {
    const pool = await getTestPool()
    await pool.query(
      `INSERT INTO ai_requests (tenant_id, user_id, request_type, model_name, status, error_message)
       VALUES (?, ?, ?, ?, 'error', 'API key not configured')`,
      [100, 100, 'summary', 'gpt-4o']
    )

    const [errors] = await pool.query(
      `SELECT COUNT(*) as count FROM ai_requests WHERE tenant_id = ? AND status = 'error'`,
      [100]
    )
    expect(errors[0].count).toBeGreaterThanOrEqual(1)
  })
})
