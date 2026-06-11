import { Router } from 'express'
import * as controller from './tenants.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const router = Router()

router.get('/', verifyToken, resolveTenant, controller.getProfile)
router.patch('/', verifyToken, resolveTenant, requireRole('manager'), controller.updateProfile)

export default router
