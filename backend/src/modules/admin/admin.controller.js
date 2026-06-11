import * as service from './admin.service.js'
import * as auditService from '../audit/audit.service.js'
import * as auditQueries from '../audit/audit.queries.js'

async function listTenants(req, res, next) {
  try {
    const result = await service.listTenants(req.query, { page: req.query.page, pageSize: req.query.pageSize })
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}

async function getTenant(req, res, next) {
  try {
    const tenant = await service.getTenant(req.params.id)
    res.json({ success: true, data: tenant })
  } catch (err) { next(err) }
}

async function updateTenant(req, res, next) {
  try {
    const tenant = await service.updateTenantProfile(req.params.id, req.body, req.user.userId)
    res.json({ success: true, data: tenant })
  } catch (err) { next(err) }
}

async function setTenantStatus(req, res, next) {
  try {
    const { status, blockedReason } = req.body
    const tenant = await service.setTenantStatus(req.params.id, status, blockedReason, req.user.userId)
    res.json({ success: true, data: tenant })
  } catch (err) { next(err) }
}

async function setTenantPlan(req, res, next) {
  try {
    const { planCode } = req.body
    const tenant = await service.setTenantPlan(req.params.id, planCode, req.user.userId)
    res.json({ success: true, data: tenant })
  } catch (err) { next(err) }
}

async function listUsers(req, res, next) {
  try {
    const result = await service.listUsers(req.query, { page: req.query.page, pageSize: req.query.pageSize })
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}

async function setUserRole(req, res, next) {
  try {
    const { roleCode } = req.body
    await service.changeUserRole(req.params.id, roleCode, req.user.userId)
    res.json({ success: true, data: { message: 'Ruolo aggiornato.' } })
  } catch (err) { next(err) }
}

async function listPlans(req, res, next) {
  try {
    const plans = await service.listPlans()
    res.json({ success: true, data: plans })
  } catch (err) { next(err) }
}

async function createPlan(req, res, next) {
  try {
    const planId = await service.createPlan(req.body, req.user.userId)
    res.status(201).json({ success: true, data: { id: planId } })
  } catch (err) { next(err) }
}

async function updatePlan(req, res, next) {
  try {
    await service.editPlan(req.params.id, req.body, req.user.userId)
    res.json({ success: true, data: { message: 'Piano aggiornato.' } })
  } catch (err) { next(err) }
}

async function getUsage(req, res, next) {
  try {
    const usage = await service.getUsage(req.params.id)
    res.json({ success: true, data: usage })
  } catch (err) { next(err) }
}

async function getGlobalAudit(req, res, next) {
  try {
    const result = await auditQueries.getGlobalAuditLogs(req.query, { page: req.query.page, pageSize: req.query.pageSize })
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}

export {
  listTenants,
  getTenant,
  updateTenant,
  setTenantStatus,
  setTenantPlan,
  listUsers,
  setUserRole,
  listPlans,
  createPlan,
  updatePlan,
  getUsage,
  getGlobalAudit,
}
