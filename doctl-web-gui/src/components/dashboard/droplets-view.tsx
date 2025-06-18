'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  Server, 
  Plus, 
  Search, 
  MoreVertical, 
  Power, 
  RotateCcw, 
  Trash2,
  Activity,
  MapPin,
  Cpu,
  HardDrive,
  RefreshCw,
  Terminal,
  Copy
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Droplet {
  id: number
  name: string
  status: string
  size: {
    slug: string
    memory: number
    vcpus: number
    disk: number
  }
  image: {
    name: string
    distribution: string
  }
  region: {
    name: string
    slug: string
  }
  networks: {
    v4: Array<{
      ip_address: string
      type: string
    }>
  }
  created_at: string
  tags: string[]
  price_monthly: number
  price_hourly: number
}

export function DropletsView() {
  const { apiToken } = useAuth()
  const [droplets, setDroplets] = useState<Droplet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDroplets, setSelectedDroplets] = useState<number[]>([])

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

  const fetchDroplets = async () => {
    setIsLoading(true)
    const data = await executeCommand('compute', ['droplet', 'list'])
    if (data) {
      setDroplets(Array.isArray(data) ? data : [])
    }
    setIsLoading(false)
  }

  const handleDropletAction = async (action: string, dropletId: number, dropletName: string) => {
    try {
      const loadingToast = toast.loading(`${action}ing ${dropletName}...`)
      
      await executeCommand('compute', ['droplet-action', action, dropletId.toString()])
      
      toast.dismiss(loadingToast)
      toast.success(`${dropletName} ${action} initiated successfully`)
      
      // Refresh droplets list after action
      setTimeout(fetchDroplets, 2000)
    } catch (error) {
      toast.error(`Failed to ${action} ${dropletName}`)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedDroplets.length === 0) return
    
    const loadingToast = toast.loading(`${action}ing ${selectedDroplets.length} droplets...`)
    
    try {
      for (const dropletId of selectedDroplets) {
        await executeCommand('compute', ['droplet-action', action, dropletId.toString()])
      }
      
      toast.dismiss(loadingToast)
      toast.success(`Bulk ${action} initiated for ${selectedDroplets.length} droplets`)
      setSelectedDroplets([])
      setTimeout(fetchDroplets, 2000)
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(`Failed to ${action} selected droplets`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  useEffect(() => {
    fetchDroplets()
  }, [apiToken])

  const filteredDroplets = droplets.filter(droplet =>
    droplet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    droplet.region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    droplet.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'off': return 'bg-gray-500'
      case 'new': return 'bg-blue-500'
      default: return 'bg-yellow-500'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Droplets</h2>
          <p className="text-muted-foreground">
            Manage your virtual private servers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchDroplets}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Droplet
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search droplets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {selectedDroplets.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedDroplets.length} selected
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('power-on')}
            >
              <Power className="h-4 w-4 mr-2" />
              Start
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('shutdown')}
            >
              <Power className="h-4 w-4 mr-2" />
              Stop
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('reboot')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reboot
            </Button>
          </div>
        )}
      </div>

      {/* Droplets Grid */}
      <div className="grid gap-4">
        {filteredDroplets.map((droplet) => (
          <Card key={droplet.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedDroplets.includes(droplet.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDroplets([...selectedDroplets, droplet.id])
                      } else {
                        setSelectedDroplets(selectedDroplets.filter(id => id !== droplet.id))
                      }
                    }}
                    className="rounded"
                  />
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{droplet.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {droplet.region.name}
                        </span>
                        <span className="flex items-center">
                          <Cpu className="h-3 w-3 mr-1" />
                          {droplet.size.vcpus} vCPUs
                        </span>
                        <span className="flex items-center">
                          <HardDrive className="h-3 w-3 mr-1" />
                          {droplet.size.memory}MB RAM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(droplet.status)} text-white`}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        {droplet.status}
                      </Badge>
                    </div>
                    {droplet.networks.v4.length > 0 && (
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <span>{droplet.networks.v4[0].ip_address}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={() => copyToClipboard(droplet.networks.v4[0].ip_address)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDropletAction('power-on', droplet.id, droplet.name)}
                      disabled={droplet.status === 'active'}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDropletAction('reboot', droplet.id, droplet.name)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Terminal className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {droplet.tags.length > 0 && (
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  {droplet.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDroplets.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No droplets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No droplets match your search criteria.' : 'You haven\'t created any droplets yet.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Droplet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}