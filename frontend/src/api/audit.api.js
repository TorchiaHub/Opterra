import client from './client'

export async function getAuditLogs(params) {
  const { data } = await client.get('/audit', { params })
  return data.data
}

export async function exportAuditLogs() {
  const { data } = await client.get('/audit/export', { responseType: 'blob' })
  return data
}
