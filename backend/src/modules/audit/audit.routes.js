import { Router } from 'express'
import * as controller from './audit.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const router = Router()

router.use(verifyToken, resolveTenant)

router.get('/', requireRole('manager'), controller.getLogs)
router.get('/export', requireRole('manager'), controller.exportLogs)

export default router
