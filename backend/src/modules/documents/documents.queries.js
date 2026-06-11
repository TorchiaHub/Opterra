import pool from '../../config/db.js'

async function getDocumentsByTender(tenderId, tenantId) {
  const [rows] = await pool.query(
    `SELECT d.*, dv.version_number as current_version, dv.original_filename, dv.mime_type, dv.size_bytes, dv.storage_path,
            CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name
     FROM documents d
     LEFT JOIN document_versions dv ON dv.id = d.current_version_id
     LEFT JOIN users u ON u.id = d.uploaded_by
     WHERE d.tender_id = ? AND d.tenant_id = ? AND d.deleted_at IS NULL
     ORDER BY d.created_at DESC`,
    [tenderId, tenantId]
  )
  return rows
}

async function createDocument(payload, trx) {
  const conn = trx || pool
  const [result] = await conn.query(
    `INSERT INTO documents (tenant_id, tender_id, document_type, title, uploaded_by)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.tenantId, payload.tenderId, payload.documentType || 'generic', payload.title, payload.uploadedBy]
  )
  return result.insertId
}

async function createDocumentVersion(payload, trx) {
  const conn = trx || pool
  const [result] = await conn.query(
    `INSERT INTO document_versions (tenant_id, document_id, version_number, original_filename, storage_path, mime_type, size_bytes, checksum_sha256, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [payload.tenantId, payload.documentId, payload.versionNumber, payload.originalFilename,
     payload.storagePath, payload.mimeType, payload.sizeBytes, payload.checksumSha256, payload.uploadedBy]
  )
  return result.insertId
}

async function setCurrentDocumentVersion(documentId, versionId, trx) {
  const conn = trx || pool
  await conn.query(
    `UPDATE documents SET current_version_id = ? WHERE id = ?`,
    [versionId, documentId]
  )
}

async function getLatestVersionNumber(documentId, tenantId) {
  const [rows] = await pool.query(
    `SELECT COALESCE(MAX(version_number), 0) as max_version
     FROM document_versions WHERE document_id = ? AND tenant_id = ?`,
    [documentId, tenantId]
  )
  return rows[0].max_version
}

async function getDocumentVersionById(docId, tenantId) {
  const [rows] = await pool.query(
    `SELECT dv.*, d.document_type, d.title
     FROM document_versions dv
     JOIN documents d ON d.id = dv.document_id
     WHERE dv.document_id = ? AND dv.tenant_id = ? AND d.deleted_at IS NULL
     ORDER BY dv.version_number DESC
     LIMIT 1`,
    [docId, tenantId]
  )
  return rows[0] || null
}

async function getDocumentVersionsList(docId, tenantId) {
  const [rows] = await pool.query(
    `SELECT dv.id, dv.version_number, dv.original_filename, dv.mime_type, dv.size_bytes, dv.checksum_sha256,
            dv.created_at, CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name
     FROM document_versions dv
     JOIN documents d ON d.id = dv.document_id
     LEFT JOIN users u ON u.id = dv.uploaded_by
     WHERE dv.document_id = ? AND dv.tenant_id = ? AND d.deleted_at IS NULL
     ORDER BY dv.version_number DESC`,
    [docId, tenantId]
  )
  return rows
}

async function softDeleteDocument(docId, tenantId) {
  const [result] = await pool.query(
    `UPDATE documents SET deleted_at = NOW() WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    [docId, tenantId]
  )
  return result.affectedRows > 0
}

async function getTenantStorageUsageMb(tenantId) {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(dv.size_bytes), 0) / 1048576 as usage_mb
     FROM document_versions dv
     JOIN documents d ON d.id = dv.document_id
     WHERE d.tenant_id = ? AND d.deleted_at IS NULL`,
    [tenantId]
  )
  return rows[0].usage_mb
}

export {
  getDocumentsByTender,
  createDocument,
  createDocumentVersion,
  setCurrentDocumentVersion,
  getLatestVersionNumber,
  getDocumentVersionById,
  getDocumentVersionsList,
  softDeleteDocument,
  getTenantStorageUsageMb,
}
