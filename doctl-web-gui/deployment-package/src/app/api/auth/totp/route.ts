import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-enhanced'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const session = authService.validateToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { secret, qrCodeUrl } = await authService.setupTOTP(session.userId)

    return NextResponse.json({
      secret,
      qrCodeUrl,
      manualEntryKey: secret
    })
  } catch (error) {
    console.error('TOTP setup error:', error)
    return NextResponse.json({ error: 'Failed to setup TOTP' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const { totpCode, action } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const session = authService.validateToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (!totpCode) {
      return NextResponse.json({ error: 'TOTP code required' }, { status: 400 })
    }

    let success = false
    if (action === 'enable') {
      success = await authService.enableTOTP(session.userId, totpCode)
    } else if (action === 'disable') {
      success = await authService.disableTOTP(session.userId, totpCode)
    }

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 400 })
    }
  } catch (error) {
    console.error('TOTP action error:', error)
    return NextResponse.json({ error: 'Failed to update TOTP' }, { status: 500 })
  }
}