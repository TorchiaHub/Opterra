import * as service from './tenders.service.js'

async function listTenders(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
      search: req.query.search,
      from: req.query.from,
      to: req.query.to,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    }
    const pagination = {
      page: req.query.page,
      pageSize: req.query.pageSize,
    }
    const result = await service.listTenders(req.tenantId, filters, pagination)
    res.json({ success: true, data: result.data, meta: result.meta })
  } catch (err) { next(err) }
}

async function getDashboard(req, res, next) {
  try {
    const stats = await service.getDashboardStats(req.tenantId)
    res.json({ success: true, data: stats })
  } catch (err) { next(err) }
}

async function getTenderDetail(req, res, next) {
  try {
    const tender = await service.getTenderDetail(Number(req.params.id), req.tenantId)
    res.json({ success: true, data: tender })
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

async function createTender(req, res, next) {
  try {
    const required = ['title', 'issuer', 'deadlineAt']
    const missing = required.filter(f => !req.body[f])
    if (missing.length > 0) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Campi obbligatori: ${missing.join(', ')}` },
      })
    }

    const tender = await service.createTender(req.body, req.user.userId, req.tenantId, req)
    res.status(201).json({ success: true, data: tender })
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

async function updateTender(req, res, next) {
  try {
    const tender = await service.updateTender(Number(req.params.id), req.body, req.tenantId, req.user.userId, req)
    res.json({ success: true, data: tender })
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

async function deleteTender(req, res, next) {
  try {
    await service.deleteTender(Number(req.params.id), req.tenantId, req.user.userId, req)
    res.json({ success: true, data: { message: 'Gara eliminata.' } })
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

async function changeStatus(req, res, next) {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'status obbligatorio.' },
      })
    }
    await service.changeStatus(Number(req.params.id), status, req.tenantId, req.user.userId, req)
    res.json({ success: true, data: { message: 'Stato aggiornato.' } })
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

async function assignTender(req, res, next) {
  try {
    const { assignments } = req.body
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'assignments array obbligatorio.' },
      })
    }
    await service.assignTender(Number(req.params.id), assignments, req.tenantId, req.user.userId, req)
    res.json({ success: true, data: { message: 'Assegnazioni salvate.' } })
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

export { listTenders, getDashboard, getTenderDetail, createTender, updateTender, deleteTender, changeStatus, assignTender }
