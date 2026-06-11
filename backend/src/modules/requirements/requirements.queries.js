import pool from '../../config/db.js'

async function getRequirementsByTender(tenderId, tenantId) {
  const [rows] = await pool.query(
    `SELECT r.id, r.title, r.source, r.created_by, r.created_at,
            ri.id as item_id, ri.label, ri.description, ri.item_type,
            ri.priority, ri.status, ri.due_at, ri.assigned_user_id,
            ri.notes, ri.ai_extracted
     FROM requirements r
     LEFT JOIN requirement_items ri ON ri.requirement_id = r.id AND ri.deleted_at IS NULL
     WHERE r.tender_id = ? AND r.tenant_id = ? AND r.deleted_at IS NULL
     ORDER BY r.id, ri.id`,
    [tenderId, tenantId]
  )

  const grouped = {}
  for (const row of rows) {
    if (!grouped[row.id]) {
      grouped[row.id] = {
        id: row.id,
        title: row.title,
        source: row.source,
        createdBy: row.created_by,
        createdAt: row.created_at,
        items: [],
      }
    }
    if (row.item_id) {
      grouped[row.id].items.push({
        id: row.item_id,
        label: row.label,
        description: row.description,
        itemType: row.item_type,
        priority: row.priority,
        status: row.status,
        dueAt: row.due_at,
        assignedUserId: row.assigned_user_id,
        notes: row.notes,
        aiExtracted: !!row.ai_extracted,
      })
    }
  }

  return Object.values(grouped)
}

async function insertRequirement(payload) {
  const [result] = await pool.query(
    `INSERT INTO requirements (tenant_id, tender_id, title, source, created_by)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.tenantId, payload.tenderId, payload.title, payload.source || 'manual', payload.createdBy]
  )
  return result.insertId
}

async function insertRequirementItems(items) {
  if (items.length === 0) return

  const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')
  const values = []
  for (const item of items) {
    values.push(
      item.tenantId, item.requirementId, item.tenderId,
      item.label, item.description || null,
      item.itemType || 'document', item.priority || 'mandatory'
    )
  }

  await pool.query(
    `INSERT INTO requirement_items (tenant_id, requirement_id, tender_id, label, description, item_type, priority)
     VALUES ${placeholders}`,
    values
  )
}

async function updateRequirementItem(itemId, tenantId, payload) {
  const fields = []
  const values = []

  const mapping = {
    status: 'status',
    notes: 'notes',
    assignedUserId: 'assigned_user_id',
    dueAt: 'due_at',
    priority: 'priority',
    label: 'label',
  }

  for (const [key, column] of Object.entries(mapping)) {
    if (payload[key] !== undefined) {
      fields.push(`${column} = ?`)
      values.push(payload[key])
    }
  }

  if (fields.length === 0) return null

  values.push(itemId, tenantId)
  const [result] = await pool.query(
    `UPDATE requirement_items SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    values
  )
  return result.affectedRows > 0
}

async function softDeleteRequirementItem(itemId, tenantId) {
  const [result] = await pool.query(
    `UPDATE requirement_items SET deleted_at = NOW() WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    [itemId, tenantId]
  )
  return result.affectedRows > 0
}

async function getRequirementItemById(itemId, tenantId) {
  const [rows] = await pool.query(
    `SELECT ri.*, r.title as requirement_title
     FROM requirement_items ri
     JOIN requirements r ON r.id = ri.requirement_id
     WHERE ri.id = ? AND ri.tenant_id = ? AND ri.deleted_at IS NULL
     LIMIT 1`,
    [itemId, tenantId]
  )
  return rows[0] || null
}

export {
  getRequirementsByTender,
  insertRequirement,
  insertRequirementItems,
  updateRequirementItem,
  softDeleteRequirementItem,
  getRequirementItemById,
}
