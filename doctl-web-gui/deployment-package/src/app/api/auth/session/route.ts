import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-enhanced'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const session = authService.validateToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = authService.getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        totpEnabled: user.totpEnabled,
        lastLogin: user.lastLogin
      },
      digitalOceanToken: user.digitalOceanToken
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}