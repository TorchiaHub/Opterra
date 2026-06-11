import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import pool from '../../config/db.js'
import env from '../../config/env.js'
import logger from '../../config/logger.js'
import * as queries from './documents.queries.js'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'image/png',
  'image/jpeg',
  'text/plain',
  'text/csv',
]

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function computeSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    stream.on('data', data => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function listDocuments(tenderId, tenantId) {
  return queries.getDocumentsByTender(tenderId, tenantId)
}

async function uploadDocument(tenderId, file, body, userId, tenantId) {
  if (!file) {
    throw Object.assign(new Error('File non fornito.'), {
      statusCode: 422, code: 'VALIDATION_ERROR',
    })
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    fs.unlinkSync(file.path)
    throw Object.assign(new Error(`Tipo file non consentito: ${file.mimetype}`), {
      statusCode: 422, code: 'VALIDATION_ERROR',
    })
  }

  const usage = await queries.getTenantStorageUsageMb(tenantId)
  const maxStorage = 1024
  if (usage + (file.size / 1048576) > maxStorage) {
    fs.unlinkSync(file.path)
    throw Object.assign(new Error('Quota storage superata.'), {
      statusCode: 429, code: 'STORAGE_QUOTA_EXCEEDED',
    })
  }

  const checksum = await computeSha256(file.path)
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const docId = await queries.createDocument({
      tenantId,
      tenderId,
      documentType: body.documentType || 'generic',
      title: body.title || file.originalname,
      uploadedBy: userId,
    }, conn)

    const versionNumber = 1
    const safeFilename = `v${versionNumber}_${sanitizeFilename(file.originalname)}`
    const dirPath = path.join(env.storage.path, String(tenantId), String(tenderId), String(docId))
    const storagePath = path.join(dirPath, safeFilename)

    fs.mkdirSync(dirPath, { recursive: true })
    fs.renameSync(file.path, storagePath)

    const versionId = await queries.createDocumentVersion({
      tenantId,
      documentId: docId,
      versionNumber,
      originalFilename: file.originalname,
      storagePath,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksumSha256: checksum,
      uploadedBy: userId,
    }, conn)

    await queries.setCurrentDocumentVersion(docId, versionId, conn)

    await conn.commit()

    logger.info('Document uploaded', { docId, versionId, tenderId, tenantId, userId })

    const docs = await queries.getDocumentsByTender(tenderId, tenantId)
    return docs
  } catch (err) {
    await conn.rollback()
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
    throw err
  } finally {
    conn.release()
  }
}

async function addVersion(tenderId, docId, file, userId, tenantId) {
  if (!file) {
    throw Object.assign(new Error('File non fornito.'), {
      statusCode: 422, code: 'VALIDATION_ERROR',
    })
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    fs.unlinkSync(file.path)
    throw Object.assign(new Error(`Tipo file non consentito: ${file.mimetype}`), {
      statusCode: 422, code: 'VALIDATION_ERROR',
    })
  }

  const docs = await queries.getDocumentsByTender(tenderId, tenantId)
  const doc = docs.find(d => d.id === docId)
  if (!doc) {
    fs.unlinkSync(file.path)
    throw Object.assign(new Error('Documento non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }

  const checksum = await computeSha256(file.path)
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const maxVersion = await queries.getLatestVersionNumber(docId, tenantId)
    const versionNumber = maxVersion + 1

    const safeFilename = `v${versionNumber}_${sanitizeFilename(file.originalname)}`
    const dirPath = path.join(env.storage.path, String(tenantId), String(tenderId), String(docId))
    const storagePath = path.join(dirPath, safeFilename)

    fs.mkdirSync(dirPath, { recursive: true })
    fs.renameSync(file.path, storagePath)

    const versionId = await queries.createDocumentVersion({
      tenantId,
      documentId: docId,
      versionNumber,
      originalFilename: file.originalname,
      storagePath,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksumSha256: checksum,
      uploadedBy: userId,
    }, conn)

    await queries.setCurrentDocumentVersion(docId, versionId, conn)

    await conn.commit()

    logger.info('Document version added', { docId, versionNumber, versionId, tenantId })
  } catch (err) {
    await conn.rollback()
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
    throw err
  } finally {
    conn.release()
  }
}

async function getDownload(docId, tenantId) {
  const version = await queries.getDocumentVersionById(docId, tenantId)
  if (!version) {
    throw Object.assign(new Error('Documento non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }

  if (!fs.existsSync(version.storage_path)) {
    throw Object.assign(new Error('File non trovato su storage.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }

  return {
    stream: fs.createReadStream(version.storage_path),
    filename: version.original_filename,
    mimeType: version.mime_type,
    sizeBytes: version.size_bytes,
  }
}

async function getVersions(docId, tenantId) {
  return queries.getDocumentVersionsList(docId, tenantId)
}

async function deleteDocument(docId, tenantId) {
  const deleted = await queries.softDeleteDocument(docId, tenantId)
  if (!deleted) {
    throw Object.assign(new Error('Documento non trovato.'), {
      statusCode: 404, code: 'NOT_FOUND',
    })
  }
  logger.info('Document deleted', { docId, tenantId })
}

export { listDocuments, uploadDocument, addVersion, getDownload, getVersions, deleteDocument }
