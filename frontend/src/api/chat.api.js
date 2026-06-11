import client from './client'

export async function getChatSessions() {
  const { data } = await client.get('/chat/sessions')
  return data.data
}

export async function createChatSession(payload) {
  const { data } = await client.post('/chat/sessions', payload)
  return data.data
}

export async function getChatMessages(sessionId) {
  const { data } = await client.get(`/chat/sessions/${sessionId}/messages`)
  return data.data
}

export async function sendChatMessage(sessionId, payload) {
  const { data } = await client.post(`/chat/sessions/${sessionId}/messages`, payload)
  return data.data
}
