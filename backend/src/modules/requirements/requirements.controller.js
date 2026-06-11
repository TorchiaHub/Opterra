import * as service from './requirements.service.js'

async function getRequirements(req, res, next) {
  try {
    const requirements = await service.getRequirements(Number(req.params.id), req.tenantId)
    res.json({ success: true, data: requirements })
  } catch (err) { next(err) }
}

async function addRequirement(req, res, next) {
  try {
    if (!req.body.title) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'title obbligatorio.' },
      })
    }
    const requirements = await service.addRequirement(
      Number(req.params.id), req.body, req.user.userId, req.tenantId, req
    )
    res.status(201).json({ success: true, data: requirements })
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

async function updateItem(req, res, next) {
  try {
    await service.updateItem(Number(req.params.itemId), req.body, req.tenantId, req.user.userId, req)
    res.json({ success: true, data: { message: 'Item aggiornato.' } })
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

async function deleteItem(req, res, next) {
  try {
    await service.deleteItem(Number(req.params.itemId), req.tenantId, req.user.userId, req)
    res.json({ success: true, data: { message: 'Item eliminato.' } })
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

export { getRequirements, addRequirement, updateItem, deleteItem }
