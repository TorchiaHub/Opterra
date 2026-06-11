import client from './client'

export async function getTenders(params) {
  const { data } = await client.get('/tenders', { params })
  return data.data
}

export async function getTenderById(id) {
  const { data } = await client.get(`/tenders/${id}`)
  return data.data
}

export async function createTender(payload) {
  const { data } = await client.post('/tenders', payload)
  return data.data
}

export async function updateTender(id, payload) {
  const { data } = await client.patch(`/tenders/${id}`, payload)
  return data.data
}

export async function updateTenderStatus(id, status) {
  const { data } = await client.patch(`/tenders/${id}/status`, { status })
  return data.data
}

export async function assignTender(id, payload) {
  const { data } = await client.post(`/tenders/${id}/assign`, payload)
  return data.data
}

export async function getTenderDashboard() {
  const { data } = await client.get('/tenders/dashboard')
  return data.data
}
