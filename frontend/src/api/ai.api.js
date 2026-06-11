import client from './client'

export async function extractRequirements(payload) {
  const { data } = await client.post('/ai/extract-requirements', payload)
  return data.data
}

export async function runComplianceCheck(payload) {
  const { data } = await client.post('/ai/compliance-check', payload)
  return data.data
}

export async function generateSummary(payload) {
  const { data } = await client.post('/ai/summary', payload)
  return data.data
}

export async function runGoNoGo(payload) {
  const { data } = await client.post('/ai/go-nogo', payload)
  return data.data
}

export async function askTenderQuestion(payload) {
  const { data } = await client.post('/ai/qa', payload)
  return data.data
}

export async function generateDraft(payload) {
  const { data } = await client.post('/ai/draft', payload)
  return data.data
}
