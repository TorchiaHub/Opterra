import pool from '../../config/db.js'

async function getSourcesByTenant(tenantId) {
  const [rows] = await pool.query(
    `SELECT * FROM scraping_sources WHERE tenant_id = ? ORDER BY name ASC`,
    [tenantId]
  )
  return rows
}

async function createSource(payload) {
  const [result] = await pool.query(
    `INSERT INTO scraping_sources (tenant_id, name, source_type, base_url, config_json, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payload.tenantId, payload.name, payload.sourceType, payload.baseUrl,
     payload.configJson ? JSON.stringify(payload.configJson) : null,
     payload.isActive !== undefined ? payload.isActive : 1]
  )
  return result.insertId
}

async function deleteSource(sourceId, tenantId) {
  const [result] = await pool.query(
    `DELETE FROM scraping_sources WHERE id = ? AND tenant_id = ?`,
    [sourceId, tenantId]
  )
  return result.affectedRows > 0
}

async function createScrapingJob(payload) {
  const [result] = await pool.query(
    `INSERT INTO scraping_jobs (tenant_id, source_id, status) VALUES (?, ?, 'queued')`,
    [payload.tenantId, payload.sourceId]
  )
  return result.insertId
}

async function insertScrapedTenders(items) {
  if (items.length === 0) return

  const placeholders = items.map(() =>
    `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NULL, NOW(), NOW())`
  ).join(', ')

  const values = []
  for (const item of items) {
    values.push(
      item.tenantId, item.sourceId, item.externalId,
      item.title, item.issuer || null, item.summary || null,
      item.sourceUrl || null, item.publicationDate || null,
      item.deadlineAt || null, item.estimatedValue || null,
      item.rawPayloadJson ? JSON.stringify(item.rawPayloadJson) : null,
      item.aiRelevanceScore || null,
      item.aiTagsJson ? JSON.stringify(item.aiTagsJson) : null
    )
  }

  await pool.query(
    `INSERT INTO scraped_tenders
     (tenant_id, source_id, external_id, title, issuer, summary, source_url,
      publication_date, deadline_at, estimated_value, raw_payload_json,
      ai_relevance_score, ai_tags_json, status, converted_tender_id, created_at, updated_at)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       updated_at = NOW()`,
    values
  )
}

async function getScrapedTendersByTenant(tenantId, filters = {}) {
  let sql = `SELECT st.*, ss.name as source_name
             FROM scraped_tenders st
             JOIN scraping_sources ss ON ss.id = st.source_id
             WHERE st.tenant_id = ?`
  const params = [tenantId]

  if (filters.status) {
    sql += ' AND st.status = ?'
    params.push(filters.status)
  }

  if (filters.search) {
    sql += ' AND (st.title LIKE ? OR st.issuer LIKE ?)'
    const like = `%${filters.search}%`
    params.push(like, like)
  }

  if (filters.minScore) {
    sql += ' AND st.ai_relevance_score >= ?'
    params.push(parseFloat(filters.minScore))
  }

  sql += ' ORDER BY st.created_at DESC'

  const [rows] = await pool.query(sql, params)
  return rows
}

async function updateScrapedTenderStatus(scrapedId, status, tenantId) {
  const [result] = await pool.query(
    `UPDATE scraped_tenders SET status = ? WHERE id = ? AND tenant_id = ?`,
    [status, scrapedId, tenantId]
  )
  return result.affectedRows > 0
}

async function convertScrapedTenderToTender(scrapedId, tenantId, userId, trx) {
  const conn = trx || pool

  const [scraped] = await conn.query(
    `SELECT * FROM scraped_tenders WHERE id = ? AND tenant_id = ? LIMIT 1`,
    [scrapedId, tenantId]
  )
  if (scraped.length === 0) return null

  const s = scraped[0]
  const [result] = await conn.query(
    `INSERT INTO tenders (tenant_id, title, issuer, type, reference_code, description,
      value_amount, deadline_at, status, source_type, source_url, created_by)
     VALUES (?, ?, ?, 'tender', ?, ?, ?, ?, 'draft', 'scraped', ?, ?)`,
    [tenantId, s.title, s.issuer || '', s.external_id, s.summary || '',
     s.estimated_value, s.deadline_at, s.source_url || '', userId]
  )
  const tenderId = result.insertId

  await conn.query(
    `UPDATE scraped_tenders SET status = 'saved', converted_tender_id = ? WHERE id = ?`,
    [tenderId, scrapedId]
  )

  return tenderId
}

export {
  getSourcesByTenant, createSource, deleteSource,
  createScrapingJob, insertScrapedTenders,
  getScrapedTendersByTenant, updateScrapedTenderStatus,
  convertScrapedTenderToTender,
}
