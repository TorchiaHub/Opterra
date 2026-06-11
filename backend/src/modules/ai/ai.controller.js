import * as service from './ai.service.js'

async function extractRequirements(req, res, next) {
  try {
    const result = await service.extractRequirements(req.body, req.user.userId, req.tenantId, req)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

async function summary(req, res, next) {
  try {
    const result = await service.summary(req.body, req.user.userId, req.tenantId, req)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

async function complianceCheck(req, res, next) {
  try {
    const result = await service.complianceCheck(req.body, req.user.userId, req.tenantId, req)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

async function goNogo(req, res, next) {
  try {
    const result = await service.goNogo(req.body, req.user.userId, req.tenantId, req)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

async function qa(req, res, next) {
  try {
    const result = await service.qa(req.body, req.user.userId, req.tenantId, req)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

async function draft(req, res, next) {
  try {
    const result = await service.draft(req.body, req.user.userId, req.tenantId, req)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

export { extractRequirements, summary, complianceCheck, goNogo, qa, draft }
