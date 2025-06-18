import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-enhanced'

export async function POST(request: NextRequest) {
  try {
    const { username, password, totpCode } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const result = await authService.validateLogin({ username, password, totpCode })
    
    if (!result) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const { user, token } = result

    // Set HTTP-only cookie for security
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        totpEnabled: user.totpEnabled,
        lastLogin: user.lastLogin
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error) {
      if (error.message === 'TOTP code required') {
        return NextResponse.json({ error: 'TOTP code required', requireTotp: true }, { status: 400 })
      }
      if (error.message === 'Invalid TOTP code') {
        return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 401 })
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}