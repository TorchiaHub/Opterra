import client from './client'

export async function getDocumentsByTender(tenderId) {
  const { data } = await client.get(`/tenders/${tenderId}/documents`)
  return data.data
}

export async function uploadDocument(tenderId, formData) {
  const { data } = await client.post(`/tenders/${tenderId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function downloadDocument(docId) {
  const { data } = await client.get(`/documents/${docId}/download`, {
    responseType: 'blob',
  })
  return data
}

export async function getDocumentVersions(docId) {
  const { data } = await client.get(`/documents/${docId}/versions`)
  return data.data
}

export async function deleteDocument(docId) {
  const { data } = await client.delete(`/documents/${docId}`)
  return data.data
}
