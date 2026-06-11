import * as service from './scraping.service.js'

async function listSources(req, res, next) {
  try {
    const sources = await service.listSources(req.tenantId)
    res.json({ success: true, data: sources })
  } catch (err) { next(err) }
}

async function addSource(req, res, next) {
  try {
    const { name, sourceType, baseUrl } = req.body
    if (!name || !sourceType || !baseUrl) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name, sourceType e baseUrl obbligatori.' },
      })
    }
    const sources = await service.addSource(req.body, req.user.userId, req.tenantId, req)
    res.status(201).json({ success: true, data: sources })
  } catch (err) { next(err) }
}

async function removeSource(req, res, next) {
  try {
    await service.removeSource(Number(req.params.id), req.tenantId, req.user.userId, req)
    res.json({ success: true, data: { message: 'Sorgente rimossa.' } })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

async function listScrapedTenders(req, res, next) {
  try {
    const filters = { status: req.query.status, search: req.query.search, minScore: req.query.minScore }
    const tenders = await service.listScrapedTenders(req.tenantId, filters)
    res.json({ success: true, data: tenders })
  } catch (err) { next(err) }
}

async function changeStatus(req, res, next) {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'status obbligatorio.' },
      })
    }
    await service.changeScrapedStatus(Number(req.params.id), status, req.tenantId, req.user.userId, req)
    res.json({ success: true, data: { message: 'Stato aggiornato.' } })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

async function convertToTender(req, res, next) {
  try {
    const result = await service.convertToTender(Number(req.params.id), req.user.userId, req.tenantId, req)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

export { listSources, addSource, removeSource, listScrapedTenders, changeStatus, convertToTender }
