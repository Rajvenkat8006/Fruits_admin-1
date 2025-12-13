import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

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

export function generateToken(userId: string, isAdmin: boolean = false): string {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: '7d' })
}

// Legacy verification for Node.js environment (APIs)
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

// Edge-compatible verification for Middleware
export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    return verified.payload as { userId: string }
  } catch (err) {
    return null
  }
}
