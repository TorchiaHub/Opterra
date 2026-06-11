import { Router } from 'express'
import * as controller from './tasks.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const router = Router()

router.use(verifyToken, resolveTenant)

router.get('/:id/tasks', controller.listTasks)
router.post('/:id/tasks', requireRole('manager'), controller.createTask)
router.patch('/tasks/:taskId', controller.updateTask)
router.delete('/tasks/:taskId', requireRole('manager'), controller.deleteTask)
router.post('/tasks/:taskId/comments', controller.addComment)
router.get('/tasks/:taskId/comments', controller.getComments)
router.get('/tasks/:taskId/approvals', controller.getApproval)
router.post('/tasks/:taskId/approvals', requireRole('manager'), controller.createApproval)
router.post('/tasks/:taskId/approvals/:stepId/approve', controller.approveStep)
router.post('/tasks/:taskId/approvals/:stepId/reject', controller.rejectStep)

export default router
