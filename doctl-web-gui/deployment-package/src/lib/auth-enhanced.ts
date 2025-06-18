import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export interface User {
  id: string
  username: string
  passwordHash: string
  totpSecret?: string
  totpEnabled: boolean
  digitalOceanToken: string
  role: 'admin' | 'user'
  createdAt: Date
  lastLogin?: Date
}

export interface LoginCredentials {
  username: string
  password: string
  totpCode?: string
}

export interface AuthSession {
  userId: string
  username: string
  role: string
  exp: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret-change-this'
const BCRYPT_ROUNDS = 12

export class AuthService {
  private users: Map<string, User> = new Map()

  constructor() {
    // Initialize with default admin user if none exists
    this.initializeDefaultUser()
  }

  private async initializeDefaultUser() {
    if (this.users.size === 0) {
      const defaultUser: User = {
        id: '1',
        username: 'admin',
        passwordHash: await bcrypt.hash('admin123', BCRYPT_ROUNDS),
        totpEnabled: false,
        digitalOceanToken: '',
        role: 'admin',
        createdAt: new Date()
      }
      this.users.set(defaultUser.id, defaultUser)
    }
  }

  async createUser(username: string, password: string, digitalOceanToken: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const id = Date.now().toString()
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    
    const user: User = {
      id,
      username,
      passwordHash,
      totpEnabled: false,
      digitalOceanToken,
      role,
      createdAt: new Date()
    }
    
    this.users.set(id, user)
    return user
  }

  async validateLogin(credentials: LoginCredentials): Promise<{ user: User; token: string } | null> {
    const user = Array.from(this.users.values()).find(u => u.username === credentials.username)
    
    if (!user) {
      return null
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
    if (!isValidPassword) {
      return null
    }

    // Validate TOTP if enabled
    if (user.totpEnabled && user.totpSecret) {
      if (!credentials.totpCode) {
        throw new Error('TOTP code required')
      }
      
      const isValidTotp = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: credentials.totpCode,
        window: 2
      })
      
      if (!isValidTotp) {
        throw new Error('Invalid TOTP code')
      }
    }

    // Update last login
    user.lastLogin = new Date()
    this.users.set(user.id, user)

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      } as AuthSession,
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return { user, token }
  }

  async setupTOTP(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = this.users.get(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const secret = speakeasy.generateSecret({
      name: `DigitalOcean Admin (${user.username})`,
      issuer: 'admin.realproductpat.com'
    })

    // Store the secret temporarily (user needs to verify it first)
    user.totpSecret = secret.base32
    this.users.set(userId, user)

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return {
      secret: secret.base32,
      qrCodeUrl
    }
  }

  async enableTOTP(userId: string, totpCode: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user || !user.totpSecret) {
      return false
    }

    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 2
    })

    if (isValid) {
      user.totpEnabled = true
      this.users.set(userId, user)
      return true
    }

    return false
  }

  async disableTOTP(userId: string, totpCode: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user || !user.totpSecret) {
      return false
    }

    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 2
    })

    if (isValid) {
      user.totpEnabled = false
      user.totpSecret = undefined
      this.users.set(userId, user)
      return true
    }

    return false
  }

  validateToken(token: string): AuthSession | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthSession
      return decoded
    } catch {
      return null
    }
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id)
  }

  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username)
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user) {
      return false
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    this.users.set(userId, user)
    return true
  }

  async updateUserToken(userId: string, digitalOceanToken: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user) {
      return false
    }

    user.digitalOceanToken = digitalOceanToken
    this.users.set(userId, user)
    return true
  }

  listUsers(): User[] {
    return Array.from(this.users.values()).map(user => ({
      ...user,
      passwordHash: '[REDACTED]',
      totpSecret: user.totpSecret ? '[HIDDEN]' : undefined
    }))
  }

  deleteUser(userId: string): boolean {
    return this.users.delete(userId)
  }
}

// Singleton instance
export const authService = new AuthService()