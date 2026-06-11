import { Router } from 'express'
import * as controller from './auth.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'

const router = Router()

router.post('/register', controller.register)
router.post('/login', controller.login)
router.post('/refresh', controller.refresh)
router.post('/logout', verifyToken, controller.logout)

export default router
