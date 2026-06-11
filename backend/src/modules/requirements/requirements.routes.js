import { Router } from 'express'
import * as controller from './requirements.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const router = Router()

router.use(verifyToken, resolveTenant)

router.get('/:id/requirements', controller.getRequirements)
router.post('/:id/requirements', requireRole('manager'), controller.addRequirement)
router.patch('/requirements/:itemId', controller.updateItem)
router.delete('/requirements/:itemId', requireRole('manager'), controller.deleteItem)

export default router
