import client from './client'

export async function login({ email, password }) {
  const { data } = await client.post('/auth/login', { email, password })
  localStorage.setItem('tenderflow_access_token', data.data.accessToken)
  localStorage.setItem('tenderflow_refresh_token', data.data.refreshToken)
  return data.data
}

export async function registerCompany(payload) {
  const { data } = await client.post('/auth/register', payload)
  localStorage.setItem('tenderflow_access_token', data.data.accessToken)
  localStorage.setItem('tenderflow_refresh_token', data.data.refreshToken)
  return data.data
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('tenderflow_refresh_token')
  const { data } = await client.post('/auth/refresh', { refreshToken })
  localStorage.setItem('tenderflow_access_token', data.data.accessToken)
  if (data.data.refreshToken) {
    localStorage.setItem('tenderflow_refresh_token', data.data.refreshToken)
  }
  return data.data
}

export async function logout() {
  const token = localStorage.getItem('tenderflow_refresh_token')
  try {
    await client.post('/auth/logout', { refreshToken: token })
  } finally {
    localStorage.removeItem('tenderflow_access_token')
    localStorage.removeItem('tenderflow_refresh_token')
  }
}

export async function getMe() {
  const { data } = await client.get('/auth/me')
  return data.data
}