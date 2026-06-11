import { Router } from 'express'
import * as controller from './scraping.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const router = Router()

router.use(verifyToken, resolveTenant)

router.get('/sources', requireRole('manager'), controller.listSources)
router.post('/sources', requireRole('manager'), controller.addSource)
router.delete('/sources/:id', requireRole('manager'), controller.removeSource)
router.get('/tenders', controller.listScrapedTenders)
router.patch('/tenders/:id/status', controller.changeStatus)
router.post('/tenders/:id/convert', requireRole('manager'), controller.convertToTender)

export default router
