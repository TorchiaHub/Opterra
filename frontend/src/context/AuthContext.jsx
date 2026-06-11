import { createContext, useState, useCallback, useEffect } from 'react'
import * as authApi from '../api/auth.api'

export const AuthContext = createContext(null)

const STORAGE_KEY = 'tenderflow_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
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

  const checkSession = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      await authApi.getMe()
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    checkSession()
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password })
    const userData = result.user
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (payload) => {
    const result = await authApi.registerCompany(payload)
    const userData = result.user
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
