'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Overview } from '@/components/dashboard/overview'
import { DropletsView } from '@/components/dashboard/droplets-view'
import { TerminalView } from '@/components/dashboard/terminal-view'
import {
  DomainsView,
  FirewallsView,
  DatabasesView,
  KubernetesView,
  AppsView,
  RegistryView,
  VPCsView,
  LoadBalancersView,
  VolumesView,
  SnapshotsView,
  ImagesView,
  KeysView,
  CertificatesView,
  CDNView,
  MonitoringView,
  ProjectsView,
  BillingView,
  SettingsView,
} from '@/components/dashboard/placeholder-views'

export type ViewType = 
  | 'overview'
  | 'droplets'
  | 'domains' 
  | 'firewalls'
  | 'databases'
  | 'kubernetes'
  | 'apps'
  | 'registry'
  | 'vpcs'
  | 'load-balancers'
  | 'volumes'
  | 'snapshots'
  | 'images'
  | 'keys'
  | 'certificates'
  | 'cdn'
  | 'monitoring'
  | 'projects'
  | 'billing'
  | 'terminal'
  | 'settings'

export function Dashboard() {
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <Overview />
      case 'droplets':
        return <DropletsView />
      case 'domains':
        return <DomainsView />
      case 'firewalls':
        return <FirewallsView />
      case 'databases':
        return <DatabasesView />
      case 'kubernetes':
        return <KubernetesView />
      case 'apps':
        return <AppsView />
      case 'registry':
        return <RegistryView />
      case 'vpcs':
        return <VPCsView />
      case 'load-balancers':
        return <LoadBalancersView />
      case 'volumes':
        return <VolumesView />
      case 'snapshots':
        return <SnapshotsView />
      case 'images':
        return <ImagesView />
      case 'keys':
        return <KeysView />
      case 'certificates':
        return <CertificatesView />
      case 'cdn':
        return <CDNView />
      case 'monitoring':
        return <MonitoringView />
      case 'projects':
        return <ProjectsView />
      case 'billing':
        return <BillingView />
      case 'terminal':
        return <TerminalView />
      case 'settings':
        return <SettingsView />
      default:
        return <Overview />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeView={activeView}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}