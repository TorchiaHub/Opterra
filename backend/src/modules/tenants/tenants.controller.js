import * as service from './tenants.service.js'

async function getProfile(req, res, next) {
  try {
    const tenant = await service.getProfile(req.tenantId)
    res.json({
      success: true,
      data: tenant,
    })
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

async function updateProfile(req, res, next) {
  try {
    const tenant = await service.updateProfile(req.tenantId, req.body)
    res.json({
      success: true,
      data: tenant,
    })
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

export { getProfile, updateProfile }
