import * as service from './documents.service.js'

async function listDocuments(req, res, next) {
  try {
    const docs = await service.listDocuments(Number(req.params.id), req.tenantId)
    res.json({ success: true, data: docs })
  } catch (err) { next(err) }
}

async function uploadDocument(req, res, next) {
  try {
    const docs = await service.uploadDocument(
      Number(req.params.id), req.file, req.body, req.user.userId, req.tenantId
    )
    res.status(201).json({ success: true, data: docs })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: { code: err.code, message: err.message },
      })
    }
    next(err)
  }
}

async function addVersion(req, res, next) {
  try {
    await service.addVersion(
      Number(req.params.id), Number(req.params.docId), req.file, req.user.userId, req.tenantId
    )
    res.json({ success: true, data: { message: 'Versione aggiunta.' } })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: { code: err.code, message: err.message },
      })
    }
    next(err)
  }
}

async function downloadDocument(req, res, next) {
  try {
    const result = await service.getDownload(Number(req.params.docId), req.tenantId)
    res.setHeader('Content-Type', result.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
    res.setHeader('Content-Length', result.sizeBytes)
    result.stream.pipe(res)
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: { code: err.code, message: err.message },
      })
    }
    next(err)
  }
}

async function getVersions(req, res, next) {
  try {
    const versions = await service.getVersions(Number(req.params.docId), req.tenantId)
    res.json({ success: true, data: versions })
  } catch (err) { next(err) }
}

async function deleteDocument(req, res, next) {
  try {
    await service.deleteDocument(Number(req.params.docId), req.tenantId)
    res.json({ success: true, data: { message: 'Documento eliminato.' } })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: { code: err.code, message: err.message },
      })
    }
    next(err)
  }
}

export { listDocuments, uploadDocument, addVersion, downloadDocument, getVersions, deleteDocument }
