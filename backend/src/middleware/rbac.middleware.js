const roleHierarchy = {
  superadmin: 3,
  manager: 2,
  user: 1,
}

function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Ruolo utente non trovato.',
        },
      })
    }

    const userLevel = roleHierarchy[req.user.role] || 0
    const requiredLevel = roleHierarchy[minRole] || 0

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Ruolo insufficiente per questa operazione.',
        },
      })
    }

    next()
  }
}

function requireSuperadmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Solo il superadmin può eseguire questa operazione.',
      },
    })
  }

  next()
}

export { requireRole, requireSuperadmin }
