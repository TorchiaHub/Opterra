import client from './client'

export async function getUsers() {
  const { data } = await client.get('/users')
  return data.data
}

export async function inviteUser(payload) {
  const { data } = await client.post('/users/invite', payload)
  return data.data
}

export async function updateUserRole(id, role) {
  const { data } = await client.patch(`/users/${id}/role`, { role })
  return data.data
}

export async function deleteUser(id) {
  const { data } = await client.delete(`/users/${id}`)
  return data.data
}

export async function getGroups() {
  const { data } = await client.get('/users/groups')
  return data.data
}

export async function createGroup(payload) {
  const { data } = await client.post('/users/groups', payload)
  return data.data
}

export async function addGroupMember(groupId, payload) {
  const { data } = await client.post(`/users/groups/${groupId}/members`, payload)
  return data.data
}
