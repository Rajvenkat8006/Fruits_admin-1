import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@prisma/client'
import { AuthPayload, verifyToken } from '@/lib/auth'

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('token')?.value
  if (cookieToken) return cookieToken

  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return null
}

export function requireAuth(request: NextRequest): AuthPayload {
  const token = getTokenFromRequest(request)
  if (!token) {
    throw new ApiError('Unauthorized', 401)
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw new ApiError('Invalid token', 401)
  }

  return payload
}

export function requireRoles(auth: AuthPayload, roles: Role[]): AuthPayload {
  if (!roles.includes(auth.role)) {
    throw new ApiError('Forbidden', 403)
  }
  return auth
}

export function requireAdmin(auth: AuthPayload): AuthPayload {
  return requireRoles(auth, [Role.SUPER_ADMIN, Role.SUB_ADMIN])
}

export function requireSuperAdmin(auth: AuthPayload): AuthPayload {
  return requireRoles(auth, [Role.SUPER_ADMIN])
}

export function assertShopAccess(auth: AuthPayload, shopId: string | null | undefined) {
  if (auth.role === Role.SUPER_ADMIN) return

  if (!auth.shopId) {
    throw new ApiError('Shop not assigned', 403)
  }

  if (!shopId || auth.shopId !== shopId) {
    throw new ApiError('Forbidden: shop access denied', 403)
  }
}

/** Prisma where fragment for shop-scoped queries */
export function shopScopeFilter(auth: AuthPayload): { shopId?: string } {
  if (auth.role === Role.SUPER_ADMIN) return {}
  if (!auth.shopId) {
    throw new ApiError('Shop not assigned', 403)
  }
  return { shopId: auth.shopId }
}

export function resolveShopId(
  auth: AuthPayload,
  requestedShopId?: string | null
): string {
  if (auth.role === Role.SUPER_ADMIN) {
    const shopId = requestedShopId || auth.shopId
    if (!shopId) {
      throw new ApiError('shopId is required', 400)
    }
    return shopId
  }

  if (!auth.shopId) {
    throw new ApiError('Shop not assigned', 403)
  }

  if (requestedShopId && requestedShopId !== auth.shopId) {
    throw new ApiError('Forbidden: cannot use another shop', 403)
  }

  return auth.shopId
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error(error)
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
