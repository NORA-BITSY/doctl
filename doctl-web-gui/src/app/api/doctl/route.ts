import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const { command, args = [], token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 })
    }

    // Execute doctl command
    const result = await executeDockerCommand([command, ...args, '--output', 'json'], token)
    
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Command execution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function executeDockerCommand(args: string[], token: string): Promise<{ success: boolean; data?: any; error?: string }> {
  return new Promise((resolve) => {
    const child = spawn('doctl', args, {
      env: {
        ...process.env,
        DIGITALOCEAN_ACCESS_TOKEN: token,
      },
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const data = stdout.trim() ? JSON.parse(stdout) : null
          resolve({ success: true, data })
        } catch (error) {
          // If JSON parsing fails, return raw output
          resolve({ success: true, data: stdout.trim() })
        }
      } else {
        resolve({ success: false, error: stderr || stdout || 'Command failed' })
      }
    })

    child.on('error', (error) => {
      resolve({ success: false, error: error.message })
    })
  })
}