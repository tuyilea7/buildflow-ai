import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User, UserRole } from '../types'
import { USERS, DEMO_CREDENTIALS } from '../data/mockData'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('bf_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (email: string, password: string) => {
    // Simulate async auth
    await new Promise(r => setTimeout(r, 600))
    if (password !== 'password') return { ok: false, error: 'Invalid credentials.' }
    const userId = DEMO_CREDENTIALS[email.toLowerCase()]
    if (!userId) return { ok: false, error: 'User not found.' }
    const found = USERS.find(u => u.id === userId)
    if (!found) return { ok: false, error: 'User not found.' }
    if (!found.active) return { ok: false, error: 'Account is deactivated.' }
    setUser(found)
    sessionStorage.setItem('bf_user', JSON.stringify(found))
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('bf_user')
  }, [])

  const hasRole = useCallback((...roles: UserRole[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
