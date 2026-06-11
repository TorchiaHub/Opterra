import client from './client'

export async function getTasksByTender(tenderId) {
  const { data } = await client.get(`/tenders/${tenderId}/tasks`)
  return data.data
}

export async function createTask(tenderId, payload) {
  const { data } = await client.post(`/tenders/${tenderId}/tasks`, payload)
  return data.data
}

export async function updateTask(taskId, payload) {
  const { data } = await client.patch(`/tasks/${taskId}`, payload)
  return data.data
}

export async function deleteTask(taskId) {
  const { data } = await client.delete(`/tasks/${taskId}`)
  return data.data
}

export async function createTaskComment(taskId, payload) {
  const { data } = await client.post(`/tasks/${taskId}/comments`, payload)
  return data.data
}

export async function getApprovalState(taskId) {
  const { data } = await client.get(`/tasks/${taskId}/approvals`)
  return data.data
}

export async function approveStep(taskId, stepId) {
  const { data } = await client.post(`/tasks/${taskId}/approvals/${stepId}/approve`)
  return data.data
}

export async function rejectStep(taskId, stepId, payload) {
  const { data } = await client.post(`/tasks/${taskId}/approvals/${stepId}/reject`, payload)
  return data.data
}
