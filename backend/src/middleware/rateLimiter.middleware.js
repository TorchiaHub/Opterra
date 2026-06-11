import rateLimit from 'express-rate-limit'

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Troppe richieste. Riprova tra qualche minuto.' },
  },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Troppi tentativi di accesso. Riprova tra 15 minuti.' },
  },
})

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  keyGenerator: (req) => `${req.tenantId || req.ip}`,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Troppe richieste AI. Attendi prima di riprovare.' },
  },
})

export { generalLimiter, authLimiter, aiLimiter }
