import { createContext, useState, useCallback, useEffect } from 'react'
import * as authApi from '../api/auth.api'

export const AuthContext = createContext(null)

const STORAGE_KEY = 'opterra_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('tenderflow_access_token')
      if (!token) return null
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  useEffect(() => {
    const token = localStorage.getItem('tenderflow_access_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.getMe()
      .then((profile) => {
        setUser(profile)
      })
      .catch(() => {
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem('tenderflow_access_token')
        localStorage.removeItem('tenderflow_refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password })
    setUser(result.user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
    return result.user
  }, [])

  const register = useCallback(async (payload) => {
    const result = await authApi.registerCompany(payload)
    setUser(result.user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
    return result.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
    } finally {
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('opterra_access_token')
      localStorage.removeItem('tenderflow_access_token')
      localStorage.removeItem('tenderflow_refresh_token')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}