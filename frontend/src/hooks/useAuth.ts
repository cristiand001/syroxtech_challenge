// src/hooks/useAuth.ts
'use client'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('access_token')
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  return { isAuthenticated, logout }
}
