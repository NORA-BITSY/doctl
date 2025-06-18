'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/providers/auth-provider'
import { Terminal, Send, Clear, Copy, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface CommandHistory {
  id: string
  command: string
  output: string
  timestamp: Date
  success: boolean
}

export function TerminalView() {
  const { apiToken } = useAuth()
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<CommandHistory[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return

    setIsExecuting(true)
    const commandId = Date.now().toString()
    
    // Add command to history immediately
    const newHistoryItem: CommandHistory = {
      id: commandId,
      command: cmd,
      output: 'Executing...',
      timestamp: new Date(),
      success: true
    }
    
    setHistory(prev => [...prev, newHistoryItem])
    setCommandHistory(prev => [...prev, cmd])
    setCommand('')
    setHistoryIndex(-1)

    try {
      // Parse the command to extract doctl arguments
      const args = cmd.trim().split(' ')
      let doctlArgs: string[] = []
      
      if (args[0] === 'doctl') {
        doctlArgs = args.slice(1)
      } else {
        // If user doesn't prefix with 'doctl', assume it's a doctl command
        doctlArgs = args
      }

      const response = await fetch('/api/doctl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: doctlArgs[0] || 'help', 
          args: doctlArgs.slice(1), 
          token: apiToken 
        }),
      })
      
      const result = await response.json()
      
      // Update the command in history with the result
      setHistory(prev => prev.map(item => 
        item.id === commandId 
          ? {
              ...item,
              output: result.success 
                ? (typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2))
                : result.error || 'Command failed',
              success: result.success
            }
          : item
      ))
    } catch (error) {
      setHistory(prev => prev.map(item => 
        item.id === commandId 
          ? {
              ...item,
              output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              success: false
            }
          : item
      ))
    } finally {
      setIsExecuting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(command)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand('')
      }
    }
  }

  const clearTerminal = () => {
    setHistory([])
    toast.success('Terminal cleared')
  }

  const copyOutput = (output: string) => {
    navigator.clipboard.writeText(output)
    toast.success('Output copied to clipboard')
  }

  const downloadHistory = () => {
    const content = history
      .map(item => `[${item.timestamp.toLocaleString()}] $ ${item.command}\n${item.output}\n`)
      .join('\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `doctl-history-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Auto scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">doctl Terminal</h2>
          <p className="text-muted-foreground">
            Execute doctl commands directly from the web interface
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={downloadHistory} disabled={history.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download History
          </Button>
          <Button variant="outline" size="sm" onClick={clearTerminal} disabled={history.length === 0}>
            <Clear className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Terminal Card */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Terminal className="h-5 w-5 mr-2" />
            Terminal
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Terminal Output */}
          <div 
            ref={terminalRef}
            className="flex-1 bg-gray-900 text-green-400 font-mono text-sm p-4 overflow-y-auto"
          >
            {history.length === 0 && (
              <div className="text-gray-500">
                <p>Welcome to the doctl Web Terminal!</p>
                <p>Type doctl commands or just the command name (e.g., "compute droplet list")</p>
                <p>Use ↑/↓ arrows to navigate command history</p>
                <br />
              </div>
            )}
            
            {history.map((item) => (
              <div key={item.id} className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-blue-400">
                    <span className="text-gray-500">[{item.timestamp.toLocaleTimeString()}]</span>
                    <span className="ml-2">$</span>
                    <span className="ml-2">{item.command}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => copyOutput(item.output)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <pre className={`mt-1 whitespace-pre-wrap ${item.success ? 'text-green-400' : 'text-red-400'}`}>
                  {item.output}
                </pre>
              </div>
            ))}
            
            {isExecuting && (
              <div className="text-yellow-400">
                <span className="animate-pulse">Executing command...</span>
              </div>
            )}
          </div>

          {/* Command Input */}
          <div className="border-t bg-gray-800 p-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-mono">$</span>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter doctl command..."
                className="flex-1 bg-transparent border-none text-green-400 font-mono focus:ring-0"
                disabled={isExecuting}
              />
              <Button
                onClick={() => executeCommand(command)}
                disabled={!command.trim() || isExecuting}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm font-mono">
            <div className="space-y-1">
              <p className="font-semibold text-base font-sans">Account & Auth</p>
              <p className="text-muted-foreground">account get</p>
              <p className="text-muted-foreground">balance get</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-base font-sans">Compute</p>
              <p className="text-muted-foreground">compute droplet list</p>
              <p className="text-muted-foreground">compute image list</p>
              <p className="text-muted-foreground">compute region list</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-base font-sans">Networking</p>
              <p className="text-muted-foreground">compute domain list</p>
              <p className="text-muted-foreground">compute firewall list</p>
              <p className="text-muted-foreground">vpcs list</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-base font-sans">Storage</p>
              <p className="text-muted-foreground">compute volume list</p>
              <p className="text-muted-foreground">compute snapshot list</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-base font-sans">Kubernetes</p>
              <p className="text-muted-foreground">kubernetes cluster list</p>
              <p className="text-muted-foreground">kubernetes options</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-base font-sans">Databases</p>
              <p className="text-muted-foreground">databases list</p>
              <p className="text-muted-foreground">databases options</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}