import * as service from './tasks.service.js'

async function listTasks(req, res, next) {
  try {
    const tasks = await service.listTasks(Number(req.params.id), req.tenantId)
    res.json({ success: true, data: tasks })
  } catch (err) { next(err) }
}

async function createTask(req, res, next) {
  try {
    if (!req.body.title) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'title obbligatorio.' },
      })
    }
    const task = await service.createTask(Number(req.params.id), req.body, req.user.userId, req.tenantId)
    res.status(201).json({ success: true, data: task })
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

async function updateTask(req, res, next) {
  try {
    const task = await service.updateTask(Number(req.params.taskId), req.body, req.tenantId, req.user.userId)
    res.json({ success: true, data: task })
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

async function deleteTask(req, res, next) {
  try {
    await service.deleteTask(Number(req.params.taskId), req.tenantId)
    res.json({ success: true, data: { message: 'Task eliminato.' } })
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

async function addComment(req, res, next) {
  try {
    if (!req.body.body) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'body obbligatorio.' },
      })
    }
    await service.addComment(Number(req.params.taskId), req.body.body, req.user.userId, req.tenantId)
    res.status(201).json({ success: true, data: { message: 'Commento aggiunto.' } })
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

async function getComments(req, res, next) {
  try {
    const comments = await service.getComments(Number(req.params.taskId), req.tenantId)
    res.json({ success: true, data: comments })
  } catch (err) { next(err) }
}

async function getApproval(req, res, next) {
  try {
    const approval = await service.getApproval(Number(req.params.taskId), req.tenantId)
    res.json({ success: true, data: approval })
  } catch (err) { next(err) }
}

async function createApproval(req, res, next) {
  try {
    const { steps } = req.body
    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'steps array obbligatorio con almeno un approvatore.' },
      })
    }
    const approval = await service.createApproval(Number(req.params.taskId), steps, req.tenantId)
    res.status(201).json({ success: true, data: approval })
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

async function approveStep(req, res, next) {
  try {
    await service.approveStep(Number(req.params.stepId), req.user.userId, req.tenantId)
    res.json({ success: true, data: { message: 'Step approvato.' } })
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

async function rejectStep(req, res, next) {
  try {
    await service.rejectStep(Number(req.params.stepId), req.user.userId, req.tenantId, req.body.note)
    res.json({ success: true, data: { message: 'Step rifiutato.' } })
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

export { listTasks, createTask, updateTask, deleteTask, addComment, getComments, getApproval, createApproval, approveStep, rejectStep }
