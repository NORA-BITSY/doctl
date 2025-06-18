'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  Server, 
  Globe, 
  Shield, 
  Database, 
  Activity, 
  DollarSign,
  TrendingUp,
  Users,
  RefreshCw
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ResourceSummary {
  droplets: number
  volumes: number
  snapshots: number
  domains: number
  firewalls: number
  databases: number
  vpcs: number
  kubernetes: number
}

export function Overview() {
  const { apiToken } = useAuth()
  const [summary, setSummary] = useState<ResourceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const executeCommand = async (command: string, args: string[] = []) => {
    try {
      const response = await fetch('/api/doctl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, args, token: apiToken }),
      })
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error(`Error executing ${command}:`, error)
      return null
    }
  }

  const fetchResourceSummary = async () => {
    setIsLoading(true)
    
    const [droplets, volumes, snapshots, domains, firewalls, databases, vpcs, kubernetes] = await Promise.all([
      executeCommand('compute', ['droplet', 'list']),
      executeCommand('compute', ['volume', 'list']),
      executeCommand('compute', ['snapshot', 'list']),
      executeCommand('compute', ['domain', 'list']),
      executeCommand('compute', ['firewall', 'list']),
      executeCommand('databases', ['list']),
      executeCommand('vpcs', ['list']),
      executeCommand('kubernetes', ['cluster', 'list'])
    ])

    setSummary({
      droplets: Array.isArray(droplets) ? droplets.length : 0,
      volumes: Array.isArray(volumes) ? volumes.length : 0,
      snapshots: Array.isArray(snapshots) ? snapshots.length : 0,
      domains: Array.isArray(domains) ? domains.length : 0,
      firewalls: Array.isArray(firewalls) ? firewalls.length : 0,
      databases: Array.isArray(databases) ? databases.length : 0,
      vpcs: Array.isArray(vpcs) ? vpcs.length : 0,
      kubernetes: Array.isArray(kubernetes) ? kubernetes.length : 0
    })
    
    setLastRefresh(new Date())
    setIsLoading(false)
  }

  useEffect(() => {
    fetchResourceSummary()
  }, [apiToken])

  const resourceData = summary ? [
    { name: 'Droplets', value: summary.droplets, color: '#3b82f6' },
    { name: 'Volumes', value: summary.volumes, color: '#10b981' },
    { name: 'Domains', value: summary.domains, color: '#f59e0b' },
    { name: 'Databases', value: summary.databases, color: '#ef4444' },
    { name: 'Firewalls', value: summary.firewalls, color: '#8b5cf6' },
    { name: 'K8s Clusters', value: summary.kubernetes, color: '#06b6d4' }
  ] : []

  const quickStats = [
    {
      title: 'Total Droplets',
      value: summary?.droplets || 0,
      icon: Server,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Domains', 
      value: summary?.domains || 0,
      icon: Globe,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Firewalls',
      value: summary?.firewalls || 0,
      icon: Shield,
      color: 'bg-purple-500',
      change: '+2%'
    },
    {
      title: 'Databases',
      value: summary?.databases || 0,
      icon: Database,
      color: 'bg-red-500',
      change: '+8%'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your DigitalOcean resources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={fetchResourceSummary}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resource Distribution</CardTitle>
            <CardDescription>
              Breakdown of your DigitalOcean resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              Number of resources by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and resource management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col space-y-2">
              <Server className="h-6 w-6" />
              <span>Create Droplet</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Database className="h-6 w-6" />
              <span>Create Database</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Globe className="h-6 w-6" />
              <span>Add Domain</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}