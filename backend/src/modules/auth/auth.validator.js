function validateRegisterPayload(body) {
  const errors = []

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Il nome azienda è obbligatorio.')
  }
  if (!body.slug || typeof body.slug !== 'string' || !/^[a-z0-9-]+$/.test(body.slug)) {
    errors.push('Lo slug deve essere una stringa alfanumerica con trattini.')
  }
  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.push('Email valida obbligatoria.')
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    errors.push('Password obbligatoria (min 8 caratteri).')
  }
  if (!body.firstName || typeof body.firstName !== 'string' || body.firstName.trim().length === 0) {
    errors.push('Il nome è obbligatorio.')
  }
  if (!body.lastName || typeof body.lastName !== 'string' || body.lastName.trim().length === 0) {
    errors.push('Il cognome è obbligatorio.')
  }

  return errors
}

function validateLoginPayload(body) {
  const errors = []

  if (!body.email || typeof body.email !== 'string') {
    errors.push('Email obbligatoria.')
  }
  if (!body.password || typeof body.password !== 'string') {
    errors.push('Password obbligatoria.')
  }

  return errors
}

function validateRefreshPayload(body) {
  const errors = []

  if (!body.refreshToken || typeof body.refreshToken !== 'string') {
    errors.push('Refresh token obbligatorio.')
  }

  return errors
}

export {
  validateRegisterPayload,
  validateLoginPayload,
  validateRefreshPayload,
}
