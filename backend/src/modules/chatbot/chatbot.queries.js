import pool from '../../config/db.js'

async function getChatSessions(userId, tenantId) {
  const [rows] = await pool.query(
    `SELECT cs.*,
            (SELECT message_text FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
     FROM chat_sessions cs
     WHERE cs.user_id = ? AND cs.tenant_id = ?
     ORDER BY cs.updated_at DESC`,
    [userId, tenantId]
  )
  return rows
}

async function createChatSession(payload) {
  const [result] = await pool.query(
    `INSERT INTO chat_sessions (tenant_id, user_id, title, context_type, context_id)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.tenantId, payload.userId, payload.title || 'Nuova chat',
     payload.contextType || 'general', payload.contextId || null]
  )
  return result.insertId
}

async function getMessagesBySession(sessionId, tenantId) {
  const [rows] = await pool.query(
    `SELECT * FROM chat_messages
     WHERE session_id = ? AND tenant_id = ?
     ORDER BY created_at ASC`,
    [sessionId, tenantId]
  )
  return rows
}

async function insertChatMessage(payload) {
  const [result] = await pool.query(
    `INSERT INTO chat_messages (tenant_id, session_id, sender_type, message_text, tool_call_json)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.tenantId, payload.sessionId, payload.senderType,
     payload.messageText, payload.toolCallJson ? JSON.stringify(payload.toolCallJson) : null]
  )
  return result.insertId
}

async function updateSessionTimestamp(sessionId) {
  await pool.query(
    `UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?`,
    [sessionId]
  )
}

async function getSessionById(sessionId, tenantId) {
  const [rows] = await pool.query(
    `SELECT * FROM chat_sessions WHERE id = ? AND tenant_id = ? LIMIT 1`,
    [sessionId, tenantId]
  )
  return rows[0] || null
}

export { getChatSessions, createChatSession, getMessagesBySession, insertChatMessage, updateSessionTimestamp, getSessionById }
