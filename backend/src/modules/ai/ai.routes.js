import { Router } from 'express'
import * as controller from './ai.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const router = Router()

router.use(verifyToken, resolveTenant)

router.post('/extract-requirements', controller.extractRequirements)
router.post('/compliance-check', controller.complianceCheck)
router.post('/summary', controller.summary)
router.post('/qa', controller.qa)
router.post('/draft', controller.draft)
router.post('/go-nogo', requireRole('manager'), controller.goNogo)

export default router
