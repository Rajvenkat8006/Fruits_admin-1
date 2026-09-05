import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { Role } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export type AuthPayload = {
  userId: string
  role: Role
  shopId?: string | null
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      shopId: payload.shopId ?? null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    if (!decoded?.userId || !decoded?.role) return null
    return {
      userId: decoded.userId,
      role: decoded.role,
      shopId: decoded.shopId ?? null,
    }
  } catch {
    return null
  }
}

export async function verifyAuth(token: string): Promise<AuthPayload | null> {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    const payload = verified.payload as unknown as AuthPayload
    if (!payload?.userId || !payload?.role) return null
    return {
      userId: payload.userId,
      role: payload.role,
      shopId: payload.shopId ?? null,
    }
  } catch {
    return null
  }
}
