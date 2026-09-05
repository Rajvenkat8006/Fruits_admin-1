import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import { hashPassword } from '@/lib/auth'
import {
  requireAuth,
  requireAdmin,
  resolveShopId,
  shopScopeFilter,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

const selectFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  shopId: true,
  shop: { select: { id: true, name: true } },
  createdAt: true,
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdmin(requireAuth(request))
    const scope = shopScopeFilter(auth)

    const boys = await prisma.user.findMany({
      where: {
        role: Role.DELIVERY_BOY,
        ...scope,
      },
      select: selectFields,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(boys)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdmin(requireAuth(request))
    const body = await request.json()
    const { name, email, password, shopId: requestedShopId } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'name, email, and password are required' },
        { status: 400 }
      )
    }

    const shopId = resolveShopId(auth, requestedShopId)

    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: Role.DELIVERY_BOY,
        status: UserStatus.ACTIVE,
        shopId,
      },
      select: selectFields,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
