import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Validate token by checking account info
    const result = await executeDockerCommand(['account', 'get'], token)
    
    if (result.success) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({ valid: false, error: result.error }, { status: 401 })
    }
  } catch (error) {
    console.error('Token validation error:', error)
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
          resolve({ success: true, data: stdout.trim() })
        }
      } else {
        resolve({ success: false, error: stderr || 'Command failed' })
      }
    })

    child.on('error', (error) => {
      resolve({ success: false, error: error.message })
    })
  })
}