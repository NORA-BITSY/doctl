'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  apiToken: string | null
  login: (token: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [apiToken, setApiToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('do-api-token')
    if (storedToken) {
      validateToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setApiToken(token)
        setIsAuthenticated(true)
        localStorage.setItem('do-api-token', token)
        return true
      } else {
        // Invalid token, remove from storage
        localStorage.removeItem('do-api-token')
        return false
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      localStorage.removeItem('do-api-token')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (token: string): Promise<boolean> => {
    setIsLoading(true)
    const isValid = await validateToken(token)
    
    if (isValid) {
      toast.success('Successfully authenticated with DigitalOcean!')
    } else {
      toast.error('Invalid API token. Please check your token and try again.')
    }
    
    return isValid
  }

  const logout = () => {
    setIsAuthenticated(false)
    setApiToken(null)
    localStorage.removeItem('do-api-token')
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        apiToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}