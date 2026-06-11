import pool from '../../config/db.js'

async function getTasksByTender(tenderId, tenantId) {
  const [rows] = await pool.query(
    `SELECT t.*,
            CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,
            (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) as comments_count,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', a.id, 'status', a.status))
             FROM approvals a WHERE a.task_id = t.id) as approvals
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assigned_user_id
     WHERE t.tender_id = ? AND t.tenant_id = ? AND t.deleted_at IS NULL
     ORDER BY t.created_at DESC`,
    [tenderId, tenantId]
  )
  return rows
}

async function getTaskById(taskId, tenantId) {
  const [rows] = await pool.query(
    `SELECT t.*,
            CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,
            CONCAT(cb.first_name, ' ', cb.last_name) as created_by_name
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assigned_user_id
     LEFT JOIN users cb ON cb.id = t.created_by
     WHERE t.id = ? AND t.tenant_id = ? AND t.deleted_at IS NULL
     LIMIT 1`,
    [taskId, tenantId]
  )
  return rows[0] || null
}

async function createTask(payload) {
  const [result] = await pool.query(
    `INSERT INTO tasks (tenant_id, tender_id, title, description, status, priority, due_at, assigned_user_id, assigned_group_id, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [payload.tenantId, payload.tenderId, payload.title, payload.description || null,
     payload.status || 'todo', payload.priority || 'medium',
     payload.dueAt || null, payload.assignedUserId || null,
     payload.assignedGroupId || null, payload.createdBy]
  )
  return result.insertId
}

async function updateTask(taskId, tenantId, payload) {
  const fields = []
  const values = []

  const mapping = {
    title: 'title',
    description: 'description',
    status: 'status',
    priority: 'priority',
    dueAt: 'due_at',
    assignedUserId: 'assigned_user_id',
    assignedGroupId: 'assigned_group_id',
  }

  for (const [key, column] of Object.entries(mapping)) {
    if (payload[key] !== undefined) {
      fields.push(`${column} = ?`)
      values.push(payload[key])
    }
  }

  if (fields.length === 0) return null

  values.push(taskId, tenantId)
  const [result] = await pool.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    values
  )
  return result.affectedRows > 0
}

async function softDeleteTask(taskId, tenantId) {
  const [result] = await pool.query(
    `UPDATE tasks SET deleted_at = NOW() WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    [taskId, tenantId]
  )
  return result.affectedRows > 0
}

async function createTaskComment(payload) {
  const [result] = await pool.query(
    `INSERT INTO task_comments (tenant_id, task_id, user_id, body) VALUES (?, ?, ?, ?)`,
    [payload.tenantId, payload.taskId, payload.userId, payload.body]
  )
  return result.insertId
}

async function getTaskComments(taskId, tenantId) {
  const [rows] = await pool.query(
    `SELECT tc.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
     FROM task_comments tc
     JOIN users u ON u.id = tc.user_id
     WHERE tc.task_id = ? AND tc.tenant_id = ?
     ORDER BY tc.created_at ASC`,
    [taskId, tenantId]
  )
  return rows
}

async function createApprovalFlow(payload, trx) {
  const conn = trx || pool
  const [result] = await conn.query(
    `INSERT INTO approvals (tenant_id, task_id, status) VALUES (?, ?, 'pending')`,
    [payload.tenantId, payload.taskId]
  )
  const approvalId = result.insertId

  if (payload.steps && payload.steps.length > 0) {
    for (let i = 0; i < payload.steps.length; i++) {
      await conn.query(
        `INSERT INTO approval_steps (tenant_id, approval_id, step_order, approver_user_id)
         VALUES (?, ?, ?, ?)`,
        [payload.tenantId, approvalId, i + 1, payload.steps[i].approverUserId]
      )
    }
  }

  return approvalId
}

async function getApprovalFlow(taskId, tenantId) {
  const [approvals] = await pool.query(
    `SELECT * FROM approvals WHERE task_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT 1`,
    [taskId, tenantId]
  )
  if (approvals.length === 0) return null

  const approval = approvals[0]
  const [steps] = await pool.query(
    `SELECT as2.*, CONCAT(u.first_name, ' ', u.last_name) as approver_name
     FROM approval_steps as2
     LEFT JOIN users u ON u.id = as2.approver_user_id
     WHERE as2.approval_id = ?
     ORDER BY as2.step_order ASC`,
    [approval.id]
  )

  return { ...approval, steps }
}

async function approveStep(stepId, userId, tenantId) {
  const [result] = await pool.query(
    `UPDATE approval_steps
     SET status = 'approved', decided_at = NOW()
     WHERE id = ? AND approver_user_id = ? AND tenant_id = ? AND status = 'pending'`,
    [stepId, userId, tenantId]
  )

  if (result.affectedRows === 0) return false

  const [step] = await pool.query(
    `SELECT approval_id FROM approval_steps WHERE id = ?`,
    [stepId]
  )

  const [pendingSteps] = await pool.query(
    `SELECT COUNT(*) as cnt FROM approval_steps WHERE approval_id = ? AND status = 'pending'`,
    [step[0].approval_id]
  )

  if (pendingSteps[0].cnt === 0) {
    await pool.query(
      `UPDATE approvals SET status = 'approved' WHERE id = ?`,
      [step[0].approval_id]
    )
  }

  return true
}

async function rejectStep(stepId, userId, tenantId, note) {
  const [result] = await pool.query(
    `UPDATE approval_steps
     SET status = 'rejected', decided_at = NOW(), note = ?
     WHERE id = ? AND approver_user_id = ? AND tenant_id = ? AND status = 'pending'`,
    [note || null, stepId, userId, tenantId]
  )

  if (result.affectedRows === 0) return false

  const [step] = await pool.query(
    `SELECT approval_id FROM approval_steps WHERE id = ?`,
    [stepId]
  )

  await pool.query(
    `UPDATE approvals SET status = 'rejected' WHERE id = ?`,
    [step[0].approval_id]
  )

  return true
}

export {
  getTasksByTender,
  getTaskById,
  createTask,
  updateTask,
  softDeleteTask,
  createTaskComment,
  getTaskComments,
  createApprovalFlow,
  getApprovalFlow,
  approveStep,
  rejectStep,
}
