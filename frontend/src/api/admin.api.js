import client from './client'

export async function getTenants(params) {
  const { data } = await client.get('/admin/tenants', { params })
  return data.data
}

export async function getTenantById(id) {
  const { data } = await client.get(`/admin/tenants/${id}`)
  return data.data
}

export async function updateTenantStatus(id, status) {
  const { data } = await client.patch(`/admin/tenants/${id}/status`, { status })
  return data.data
}

export async function getPlans() {
  const { data } = await client.get('/admin/plans')
  return data.data
}

export async function updatePlan(id, payload) {
  const { data } = await client.patch(`/admin/plans/${id}`, payload)
  return data.data
}

export async function createPlan(payload) {
  const { data } = await client.post('/admin/plans', payload)
  return data.data
}

export async function getGlobalAudit(params) {
  const { data } = await client.get('/admin/audit', { params })
  return data.data
}

export async function getGlobalUsers(params) {
  const { data } = await client.get('/admin/users', { params })
  return data.data
}
