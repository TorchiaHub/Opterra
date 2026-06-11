import { Router } from 'express'
import * as controller from './chatbot.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import resolveTenant from '../../middleware/tenant.middleware.js'

const router = Router()

router.use(verifyToken, resolveTenant)

router.get('/sessions', controller.listSessions)
router.post('/sessions', controller.createSession)
router.get('/sessions/:id/messages', controller.getMessages)
router.post('/sessions/:id/messages', controller.sendMessage)

export default router
