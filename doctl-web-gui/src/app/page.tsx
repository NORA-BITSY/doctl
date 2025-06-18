'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { LoginForm } from '@/components/auth/login-form'
import { Dashboard } from '@/components/dashboard/dashboard'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Initializing DigitalOcean Control Panel...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <Dashboard />
}