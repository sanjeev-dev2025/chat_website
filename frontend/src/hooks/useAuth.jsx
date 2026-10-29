/**
 * useAuth.jsx — Authentication context + hook
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getStoredUser,
  getAccessToken,
} from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => getAccessToken())

  useEffect(() => {
    function handleExpired() {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const login = useCallback(async (username, password) => {
    const { access, user: loggedInUser } = await apiLogin(username, password)
    setToken(access)
    setUser(loggedInUser)
  }, [])

  const register = useCallback(async (username, email, password1, password2) => {
    const res = await apiRegister(username, email, password1, password2)
    if (res?.access) {
      setToken(res.access)
      setUser(res.user)
    }
    return res
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
