import { Router } from 'express'
import * as controller from './tenders.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const router = Router()

router.use(verifyToken, resolveTenant)

router.get('/dashboard', controller.getDashboard)
router.get('/', controller.listTenders)
router.get('/:id', controller.getTenderDetail)
router.post('/', requireRole('manager'), controller.createTender)
router.patch('/:id', requireRole('manager'), controller.updateTender)
router.patch('/:id/status', requireRole('manager'), controller.changeStatus)
router.post('/:id/assign', requireRole('manager'), controller.assignTender)
router.delete('/:id', requireRole('manager'), controller.deleteTender)

export default router
