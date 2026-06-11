import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url'

import env from './config/env.js'
import logger from './config/logger.js'
import errorHandler from './middleware/errorHandler.middleware.js'

import authRoutes from './modules/auth/auth.routes.js'
import tenantsRoutes from './modules/tenants/tenants.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import tendersRoutes from './modules/tenders/tenders.routes.js'
import requirementsRoutes from './modules/requirements/requirements.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('short'))

const openapiPath = path.resolve('openapi.yaml')
let swaggerDoc = null
try {
  swaggerDoc = YAML.load(openapiPath)
} catch {
  logger.warn('openapi.yaml not found, skipping Swagger UI')
}

if (swaggerDoc) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
}

app.use('/api/auth', authRoutes)
app.use('/api/me/tenant', tenantsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/tenders', tendersRoutes)
app.use('/api/tenders', requirementsRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } })
})

app.use(errorHandler)

app.listen(env.port, () => {
  logger.info(`TenderFlow backend running on port ${env.port}`)
})

export default app
