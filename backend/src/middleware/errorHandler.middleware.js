import logger from '../config/logger.js'

function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  })

  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500
        ? 'Errore interno del server.'
        : err.message,
    },
  })
}

export default errorHandler
