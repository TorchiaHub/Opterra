import client from './client'

export async function getDiscoveredTenders(params) {
  const { data } = await client.get('/scraping/tenders', { params })
  return data.data
}

export async function updateDiscoveredTenderStatus(id, payload) {
  const { data } = await client.patch(`/scraping/tenders/${id}/status`, payload)
  return data.data
}

export async function convertDiscoveredTender(id) {
  const { data } = await client.post(`/scraping/tenders/${id}/convert`)
  return data.data
}

export async function getSources() {
  const { data } = await client.get('/scraping/sources')
  return data.data
}

export async function createSource(payload) {
  const { data } = await client.post('/scraping/sources', payload)
  return data.data
}

export async function deleteSource(id) {
  const { data } = await client.delete(`/scraping/sources/${id}`)
  return data.data
}
