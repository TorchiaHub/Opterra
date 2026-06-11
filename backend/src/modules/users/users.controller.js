import * as service from './users.service.js'

async function listUsers(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
    }
    const users = await service.listUsers(req.tenantId, filters)
    res.json({ success: true, data: users })
  } catch (err) { next(err) }
}

async function getUserDetail(req, res, next) {
  try {
    const user = await service.getUserDetail(Number(req.params.id), req.tenantId)
    res.json({ success: true, data: user })
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

async function changeRole(req, res, next) {
  try {
    const { roleCode } = req.body
    if (!roleCode) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'roleCode obbligatorio.' },
      })
    }
    await service.changeRole(Number(req.params.id), roleCode, req.user.userId, req.tenantId, req)
    res.json({ success: true, data: { message: 'Ruolo aggiornato.' } })
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

async function removeUser(req, res, next) {
  try {
    await service.removeUser(Number(req.params.id), req.user.userId, req.tenantId, req)
    res.json({ success: true, data: { message: 'Utente rimosso.' } })
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

async function inviteUser(req, res, next) {
  try {
    const { email, roleCode } = req.body
    if (!email || !roleCode) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'email e roleCode obbligatori.' },
      })
    }
    const invitation = await service.inviteUser(req.tenantId, email, roleCode, req.user.userId, req)
    res.status(201).json({ success: true, data: invitation })
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

async function listGroups(req, res, next) {
  try {
    const groups = await service.listGroups(req.tenantId)
    res.json({ success: true, data: groups })
  } catch (err) { next(err) }
}

async function createGroup(req, res, next) {
  try {
    const { name, description } = req.body
    if (!name) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name obbligatorio.' },
      })
    }
    const group = await service.createGroup(req.tenantId, name, description)
    res.status(201).json({ success: true, data: group })
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

async function addGroupMember(req, res, next) {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'userId obbligatorio.' },
      })
    }
    await service.addMemberToGroup(Number(req.params.id), userId, req.tenantId)
    res.status(201).json({ success: true, data: { message: 'Membro aggiunto al gruppo.' } })
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

export { listUsers, getUserDetail, changeRole, removeUser, inviteUser, listGroups, createGroup, addGroupMember }
