import * as service from './auth.service.js'
import { validateRegisterPayload, validateLoginPayload, validateRefreshPayload } from './auth.validator.js'

async function register(req, res, next) {
  try {
    const errors = validateRegisterPayload(req.body)
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.join(' '),
        },
      })
    }

    const result = await service.register(req.body)

    res.status(201).json({
      success: true,
      data: result,
    })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      })
    }
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLoginPayload(req.body)
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.join(' '),
        },
      })
    }

    const result = await service.login(req.body.email, req.body.password)

    res.json({
      success: true,
      data: result,
    })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      })
    }
    next(err)
  }
}

async function refresh(req, res, next) {
  try {
    const errors = validateRefreshPayload(req.body)
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.join(' '),
        },
      })
    }

    const result = await service.refresh(req.body.refreshToken)

    res.json({
      success: true,
      data: result,
    })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      })
    }
    next(err)
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await service.logout(refreshToken)
    }

    res.json({
      success: true,
      data: { message: 'Logout effettuato.' },
    })
  } catch (err) {
    next(err)
  }
}

export { register, login, refresh, logout }
