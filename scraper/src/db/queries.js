import { getDb } from './database.js'

export function upsertSource(source) {
  const db = getDb()
  const existing = db.prepare('SELECT id FROM scraping_sources WHERE name = ? AND source_type = ?').get(source.name, source.source_type)
  if (existing) {
    db.prepare(`UPDATE scraping_sources SET base_url = ?, config_json = ?, is_active = ?, updated_at = datetime('now')
                WHERE id = ?`).run(source.base_url, source.config_json ? JSON.stringify(source.config_json) : null, source.is_active ? 1 : 0, existing.id)
    return existing.id
  }
  const result = db.prepare(`INSERT INTO scraping_sources (name, source_type, base_url, config_json, is_active)
                              VALUES (?, ?, ?, ?, ?)`).run(
    source.name, source.source_type, source.base_url,
    source.config_json ? JSON.stringify(source.config_json) : null,
    source.is_active !== false ? 1 : 0
  )
  return result.lastInsertRowid
}

export function getSources(activeOnly = false) {
  const db = getDb()
  const sql = activeOnly
    ? 'SELECT * FROM scraping_sources WHERE is_active = 1 ORDER BY name ASC'
    : 'SELECT * FROM scraping_sources ORDER BY name ASC'
  return db.prepare(sql).all()
}

export function getSourceById(id) {
  const db = getDb()
  return db.prepare('SELECT * FROM scraping_sources WHERE id = ?').get(id)
}

export function deleteSource(id) {
  const db = getDb()
  return db.prepare('DELETE FROM scraping_sources WHERE id = ?').run(id)
}

export function updateSourceLastRun(id) {
  const db = getDb()
  db.prepare(`UPDATE scraping_sources SET last_run_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(id)
}

export function createJob(sourceId) {
  const db = getDb()
  const result = db.prepare(`INSERT INTO scraping_jobs (source_id, status, started_at) VALUES (?, 'running', datetime('now'))`).run(sourceId)
  return result.lastInsertRowid
}

export function completeJob(jobId, itemsFound, itemsNew, errorMessage = null) {
  const db = getDb()
  const status = errorMessage ? 'failed' : 'completed'
  db.prepare(`UPDATE scraping_jobs SET status = ?, items_found = ?, items_new = ?, error_message = ?, finished_at = datetime('now') WHERE id = ?`)
    .run(status, itemsFound, itemsNew, errorMessage, jobId)
}

export function getJobs(limit = 50) {
  const db = getDb()
  return db.prepare(`
    SELECT j.*, s.name as source_name, s.source_type
    FROM scraping_jobs j
    JOIN scraping_sources s ON s.id = j.source_id
    ORDER BY j.created_at DESC
    LIMIT ?
  `).all(limit)
}

export function getJobsBySourceId(sourceId, limit = 20) {
  const db = getDb()
  return db.prepare(`
    SELECT * FROM scraping_jobs WHERE source_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(sourceId, limit)
}

export function insertScrapedTender(item) {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO scraped_tenders (source_id, external_id, title, issuer, summary, source_url,
      publication_date, deadline_at, estimated_value, category, region,
      raw_payload_json, ai_relevance_score, ai_tags_json, ai_summary, ai_analysis_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(source_id, external_id) DO UPDATE SET
      title = excluded.title,
      issuer = excluded.issuer,
      summary = excluded.summary,
      deadline_at = excluded.deadline_at,
      estimated_value = excluded.estimated_value,
      ai_relevance_score = excluded.ai_relevance_score,
      ai_tags_json = excluded.ai_tags_json,
      ai_summary = excluded.ai_summary,
      ai_analysis_json = excluded.ai_analysis_json,
      updated_at = datetime('now')
  `).run(
    item.source_id, item.external_id, item.title, item.issuer, item.summary,
    item.source_url, item.publication_date, item.deadline_at, item.estimated_value,
    item.category, item.region,
    item.raw_payload_json ? JSON.stringify(item.raw_payload_json) : null,
    item.ai_relevance_score || null,
    item.ai_tags_json ? JSON.stringify(item.ai_tags_json) : null,
    item.ai_summary || null,
    item.ai_analysis_json ? JSON.stringify(item.ai_analysis_json) : null
  )
  return result.lastInsertRowid
}

export function getScrapedTenders(filters = {}) {
  const db = getDb()
  let sql = `SELECT st.*, ss.name as source_name, ss.source_type
             FROM scraped_tenders st
             JOIN scraping_sources ss ON ss.id = st.source_id
             WHERE 1=1`
  const params = []

  if (filters.status) {
    sql += ' AND st.status = ?'
    params.push(filters.status)
  }
  if (filters.source_type) {
    sql += ' AND ss.source_type = ?'
    params.push(filters.source_type)
  }
  if (filters.search) {
    sql += ' AND (st.title LIKE ? OR st.issuer LIKE ?)'
    const like = `%${filters.search}%`
    params.push(like, like)
  }
  if (filters.min_score) {
    sql += ' AND st.ai_relevance_score >= ?'
    params.push(parseFloat(filters.min_score))
  }
  if (filters.category) {
    sql += ' AND st.category = ?'
    params.push(filters.category)
  }

  sql += ' ORDER BY st.ai_relevance_score DESC NULLS LAST, st.created_at DESC'

  if (filters.limit) {
    sql += ' LIMIT ?'
    params.push(parseInt(filters.limit))
  }

  return db.prepare(sql).all(...params)
}

export function getScrapedTenderById(id) {
  const db = getDb()
  return db.prepare(`
    SELECT st.*, ss.name as source_name, ss.source_type
    FROM scraped_tenders st
    JOIN scraping_sources ss ON ss.id = st.source_id
    WHERE st.id = ?
  `).get(id)
}

export function updateScrapedTenderStatus(id, status) {
  const db = getDb()
  return db.prepare(`UPDATE scraped_tenders SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id)
}

export function getScrapedTendersStats() {
  const db = getDb()
  const total = db.prepare('SELECT COUNT(*) as count FROM scraped_tenders').get().count
  const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM scraped_tenders GROUP BY status').all()
  const avgScore = db.prepare('SELECT ROUND(AVG(ai_relevance_score), 1) as avg FROM scraped_tenders WHERE ai_relevance_score IS NOT NULL').get().avg
  const bySource = db.prepare(`
    SELECT ss.name, ss.source_type, COUNT(*) as count
    FROM scraped_tenders st
    JOIN scraping_sources ss ON ss.id = st.source_id
    GROUP BY st.source_id
  `).all()
  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count FROM scraped_tenders WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC LIMIT 10
  `).all()
  return { total, byStatus, avgScore: avgScore || 0, bySource, byCategory }
}

export function deleteScrapedTender(id) {
  const db = getDb()
  return db.prepare('DELETE FROM scraped_tenders WHERE id = ?').run(id)
}