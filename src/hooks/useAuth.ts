'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const isLoading = status === 'loading'
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      checkAuthStatus()
    } else {
      setUser(null)
    }
  }, [session])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const login = (userData: User) => {
    setUser(userData)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
  }
}