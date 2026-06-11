import pool from '../../config/db.js'

async function getTenantById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM tenants WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
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

async function updateTenant(id, payload) {
  const fields = []
  const values = []

  if (payload.name !== undefined) { fields.push('name = ?'); values.push(payload.name) }
  if (payload.vatNumber !== undefined) { fields.push('vat_number = ?'); values.push(payload.vatNumber) }
  if (payload.industry !== undefined) { fields.push('industry = ?'); values.push(payload.industry) }
  if (payload.country !== undefined) { fields.push('country = ?'); values.push(payload.country) }
  if (payload.aiProfileJson !== undefined) { fields.push('ai_profile_json = ?'); values.push(JSON.stringify(payload.aiProfileJson)) }

  if (fields.length === 0) return null

  values.push(id)
  const [result] = await pool.query(
    `UPDATE tenants SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
    values
  )
  return result.affectedRows > 0
}

export { getTenantById, getTenantBySlug, updateTenant }
