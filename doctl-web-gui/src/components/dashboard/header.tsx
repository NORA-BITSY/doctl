'use client'

import { Button } from '@/components/ui/button'
import { ViewType } from './dashboard'
import { Menu, Moon, Sun, RefreshCw, User, Bell } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

interface HeaderProps {
  activeView: ViewType
  onToggleSidebar: () => void
}

const viewTitles: Record<ViewType, string> = {
  overview: 'Dashboard Overview',
  droplets: 'Droplets',
  domains: 'Domains & DNS',
  firewalls: 'Cloud Firewalls',
  databases: 'Managed Databases',
  kubernetes: 'Kubernetes Clusters',
  apps: 'App Platform',
  registry: 'Container Registry',
  vpcs: 'Virtual Private Clouds',
  'load-balancers': 'Load Balancers',
  volumes: 'Block Storage Volumes',
  snapshots: 'Snapshots',
  images: 'Custom Images',
  keys: 'SSH Keys',
  certificates: 'SSL Certificates',
  cdn: 'Content Delivery Network',
  monitoring: 'Monitoring & Alerting',
  projects: 'Projects',
  billing: 'Billing & Usage',
  terminal: 'doctl Terminal',
  settings: 'Settings'
}

export function Header({ activeView, onToggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {viewTitles[activeView]}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your DigitalOcean resources
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-9 w-9 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}