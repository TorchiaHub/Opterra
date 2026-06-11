import * as service from './chatbot.service.js'

async function listSessions(req, res, next) {
  try {
    const sessions = await service.listSessions(req.user.userId, req.tenantId)
    res.json({ success: true, data: sessions })
  } catch (err) { next(err) }
}

async function createSession(req, res, next) {
  try {
    const sessions = await service.createSession(req.body, req.user.userId, req.tenantId)
    res.status(201).json({ success: true, data: sessions })
  } catch (err) { next(err) }
}

async function getMessages(req, res, next) {
  try {
    const messages = await service.getMessages(Number(req.params.id), req.user.userId, req.tenantId)
    res.json({ success: true, data: messages })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

async function sendMessage(req, res, next) {
  try {
    if (!req.body.text) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'text obbligatorio.' },
      })
    }
    const result = await service.sendMessage(Number(req.params.id), req.body.text, req.user.userId, req.tenantId, req)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } })
    }
    next(err)
  }
}

export { listSessions, createSession, getMessages, sendMessage }
