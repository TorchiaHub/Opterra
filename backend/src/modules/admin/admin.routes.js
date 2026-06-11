import { Router } from 'express'
import * as controller from './admin.controller.js'
import verifyToken from '../../middleware/auth.middleware.js'
import { requireSuperadmin } from '../../middleware/rbac.middleware.js'
import { generalLimiter } from '../../middleware/rateLimiter.middleware.js'
import { validateTenantStatus, validatePlan, validateUpdatePlan, validatePlanCode, validateRoleCode } from './admin.validator.js'

const router = Router()

router.use(verifyToken, requireSuperadmin, generalLimiter)

router.get('/tenants', controller.listTenants)
router.get('/tenants/:id', controller.getTenant)
router.patch('/tenants/:id', controller.updateTenant)
router.patch('/tenants/:id/status', (req, res, next) => {
  const errors = validateTenantStatus(req.body)
  if (errors.length > 0) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors.join('; ') } })
  next()
}, controller.setTenantStatus)
router.patch('/tenants/:id/plan', (req, res, next) => {
  const errors = validatePlanCode(req.body)
  if (errors.length > 0) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors.join('; ') } })
  next()
}, controller.setTenantPlan)
router.get('/tenants/:id/usage', controller.getUsage)

router.get('/users', controller.listUsers)
router.patch('/users/:id/role', (req, res, next) => {
  const errors = validateRoleCode(req.body)
  if (errors.length > 0) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors.join('; ') } })
  next()
}, controller.setUserRole)

router.get('/plans', controller.listPlans)
router.post('/plans', (req, res, next) => {
  const errors = validatePlan(req.body)
  if (errors.length > 0) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors.join('; ') } })
  next()
}, controller.createPlan)
router.patch('/plans/:id', (req, res, next) => {
  const errors = validateUpdatePlan(req.body)
  if (errors.length > 0) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors.join('; ') } })
  next()
}, controller.updatePlan)

router.get('/audit', controller.getGlobalAudit)

export default router
