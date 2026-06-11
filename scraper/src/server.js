import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'

import { getDb, closeDb } from './db/database.js'
import { runMigrations } from './db/migrate.js'
import sourcesRoutes from './routes/sources.js'
import tendersRoutes from './routes/tenders.js'
import jobsRoutes from './routes/jobs.js'
import aiRoutes from './routes/ai.js'
import logger from './logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = parseInt(process.env.PORT) || 3001
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3001', 'http://localhost:5173']

async function start() {
  const db = getDb()
  runMigrations()
  logger.info('Database initialized and migrations applied')

  const app = express()

  app.use(helmet({ contentSecurityPolicy: false }))
  app.use(cors({ origin: CORS_ORIGINS, credentials: true }))
  app.use(express.json({ limit: '10mb' }))
  app.use(morgan('short'))

  app.use('/api/scraping', sourcesRoutes)
  app.use('/api/scraping/tenders', tendersRoutes)
  app.use('/api/scraping/jobs', jobsRoutes)
  app.use('/api/ai', aiRoutes)

  app.get('/api/health', (_req, res) => {
    try {
      getDb().prepare('SELECT 1').get()
      res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } })
    } catch (err) {
      res.status(503).json({ success: false, data: { status: 'degraded', error: err.message } })
    }
  })

  const frontendPath = path.join(__dirname, '../frontend')
  app.use(express.static(frontendPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
  })

  app.use((err, _req, res, _next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack })
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } })
  })

  if (process.env.SCRAPING_CRON !== 'disabled') {
    const { default: cron } = await import('node-cron')
    const schedule = process.env.SCRAPING_CRON || '0 6 * * *'
    cron.schedule(schedule, async () => {
      logger.info(`[Cron] Running scheduled scraping (${schedule})`)
      try {
        const { runAllActive } = await import('./scrapers/orchestrator.js')
        const results = await runAllActive()
        logger.info(`[Cron] Scheduled scraping completed: ${results.length} sources processed`)
      } catch (err) {
        logger.error(`[Cron] Scheduled scraping failed: ${err.message}`)
      }
    })
    logger.info(`Scheduled scraping enabled: ${schedule}`)
  }

  const server = app.listen(PORT, () => {
    logger.info(`Opterra Scraper running on http://localhost:${PORT}`)
    logger.info(`Dashboard: http://localhost:${PORT}/`)
    logger.info(`API: http://localhost:${PORT}/api/`)
  })

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down...')
    server.close(() => { closeDb(); process.exit(0) })
  })
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down...')
    server.close(() => { closeDb(); process.exit(0) })
  })
}

start().catch(err => {
  logger.error('Failed to start server', { error: err.message })
  process.exit(1)
})