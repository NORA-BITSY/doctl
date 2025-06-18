'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react'

export function LoginForm() {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    setIsSubmitting(true)
    await login(token.trim())
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DO</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            DigitalOcean Control Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Web interface for doctl CLI
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Connect Your Account</CardTitle>
            <CardDescription>
              Enter your DigitalOcean API token to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">API Token</Label>
                <div className="relative">
                  <Input
                    id="token"
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="dop_v1_..."
                    className="pr-10"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowToken(!showToken)}
                    disabled={isSubmitting}
                  >
                    {showToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!token.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Connect Account'
                )}
              </Button>
            </form>

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need an API token?
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open('https://cloud.digitalocean.com/account/api/tokens', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Generate Token
              </Button>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• Go to DigitalOcean control panel</p>
                <p>• Navigate to API → Tokens/Keys</p>
                <p>• Generate a new personal access token</p>
                <p>• Copy and paste it above</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Your API token is stored locally and never sent to external servers
        </div>
      </div>
    </div>
  )
}