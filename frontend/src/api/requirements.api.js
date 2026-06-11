import client from './client'

export async function getRequirementsByTender(tenderId) {
  const { data } = await client.get(`/tenders/${tenderId}/requirements`)
  return data.data
}

export async function createRequirement(tenderId, payload) {
  const { data } = await client.post(`/tenders/${tenderId}/requirements`, payload)
  return data.data
}

export async function updateRequirementItem(itemId, payload) {
  const { data } = await client.patch(`/requirements/${itemId}`, payload)
  return data.data
}

export async function deleteRequirementItem(itemId) {
  const { data } = await client.delete(`/requirements/${itemId}`)
  return data.data
}
