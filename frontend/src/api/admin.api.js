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

export async function getSubscriptions(params) {
  const { data } = await client.get('/admin/subscriptions', { params })
  return data.data
}

export async function updateSubscription(id, payload) {
  const { data } = await client.patch(`/admin/subscriptions/${id}`, payload)
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
