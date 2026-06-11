import pool from '../../config/db.js'

async function logAiRequest(payload) {
  const [result] = await pool.query(
    `INSERT INTO ai_requests (tenant_id, user_id, tender_id, request_type, model_name, prompt_tokens, completion_tokens, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [payload.tenantId, payload.userId, payload.tenderId || null,
     payload.requestType, payload.modelName || 'openai',
     payload.promptTokens || 0, payload.completionTokens || 0,
     payload.status || 'success', payload.errorMessage || null]
  )
  return result.insertId
}

async function getMonthlyAiUsage(tenantId, yearMonth) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count,
            COALESCE(SUM(prompt_tokens + completion_tokens), 0) as total_tokens
     FROM ai_requests
     WHERE tenant_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ? AND status = 'success'`,
    [tenantId, yearMonth]
  )
  return rows[0]
}

export { logAiRequest, getMonthlyAiUsage }
