import { Router } from 'express'
import * as controller from './users.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

const router = Router()

router.use(verifyToken, resolveTenant)

router.get('/', requireRole('manager'), controller.listUsers)
router.get('/groups', requireRole('manager'), controller.listGroups)
router.post('/invite', requireRole('manager'), controller.inviteUser)
router.post('/groups', requireRole('manager'), controller.createGroup)
router.post('/groups/:id/members', requireRole('manager'), controller.addGroupMember)
router.patch('/:id/role', requireRole('manager'), controller.changeRole)
router.delete('/:id', requireRole('manager'), controller.removeUser)

export default router
