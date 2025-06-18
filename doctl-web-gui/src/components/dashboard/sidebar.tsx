'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ViewType } from './dashboard'
import {
  LayoutDashboard,
  Server,
  Globe,
  Shield,
  Database,
  Boxes,
  Layers,
  Container,
  Network,
  LoadBalancer,
  HardDrive,
  Camera,
  Image,
  Key,
  Certificate,
  Zap,
  Activity,
  FolderOpen,
  CreditCard,
  Terminal,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, category: 'main' },
  { id: 'droplets', label: 'Droplets', icon: Server, category: 'compute' },
  { id: 'kubernetes', label: 'Kubernetes', icon: Boxes, category: 'compute' },
  { id: 'apps', label: 'App Platform', icon: Layers, category: 'compute' },
  { id: 'databases', label: 'Databases', icon: Database, category: 'compute' },
  { id: 'volumes', label: 'Volumes', icon: HardDrive, category: 'storage' },
  { id: 'snapshots', label: 'Snapshots', icon: Camera, category: 'storage' },
  { id: 'images', label: 'Images', icon: Image, category: 'storage' },
  { id: 'registry', label: 'Container Registry', icon: Container, category: 'storage' },
  { id: 'domains', label: 'Domains', icon: Globe, category: 'networking' },
  { id: 'vpcs', label: 'VPCs', icon: Network, category: 'networking' },
  { id: 'firewalls', label: 'Firewalls', icon: Shield, category: 'networking' },
  { id: 'load-balancers', label: 'Load Balancers', icon: LoadBalancer, category: 'networking' },
  { id: 'certificates', label: 'Certificates', icon: Certificate, category: 'networking' },
  { id: 'cdn', label: 'CDN', icon: Zap, category: 'networking' },
  { id: 'keys', label: 'SSH Keys', icon: Key, category: 'security' },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, category: 'tools' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, category: 'tools' },
  { id: 'billing', label: 'Billing', icon: CreditCard, category: 'account' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, category: 'tools' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'account' },
] as const

const categories = {
  main: 'Dashboard',
  compute: 'Compute',
  storage: 'Storage',
  networking: 'Networking',
  security: 'Security',
  tools: 'Tools',
  account: 'Account'
}

export function Sidebar({ activeView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
  const { logout } = useAuth()

  const renderNavItems = (category: keyof typeof categories) => {
    const items = navigationItems.filter(item => item.category === category)
    
    return (
      <div key={category} className="space-y-1">
        {!collapsed && (
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {categories[category]}
            </h3>
          </div>
        )}
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-9",
                collapsed ? "px-2" : "px-3",
                isActive && "bg-secondary text-secondary-foreground"
              )}
              onClick={() => onViewChange(item.id as ViewType)}
            >
              <Icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-card border-r border-border flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DO</span>
              </div>
              <div>
                <h2 className="font-semibold text-sm">DigitalOcean</h2>
                <p className="text-xs text-muted-foreground">Control Panel</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {renderNavItems('main')}
        {renderNavItems('compute')}
        {renderNavItems('storage')}
        {renderNavItems('networking')}
        {renderNavItems('security')}
        {renderNavItems('tools')}
        {renderNavItems('account')}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-9 text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed ? "px-2" : "px-3"
          )}
          onClick={logout}
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
}