function resolveTenant(req, res, next) {
  if (!req.user || !req.user.tenantId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Utente non associato a un tenant.',
      },
    })
  }

  req.tenantId = req.user.tenantId
  next()
}

export default resolveTenant
