import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import { hashPassword } from '@/lib/auth'
import {
  requireAuth,
  requireSuperAdmin,
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
    requireSuperAdmin(requireAuth(request))

    const subAdmins = await prisma.user.findMany({
      where: { role: Role.SUB_ADMIN },
      select: selectFields,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(subAdmins)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSuperAdmin(requireAuth(request))

    const body = await request.json()
    const { name, email, password, shopId } = body

    if (!name || !email || !password || !shopId) {
      return NextResponse.json(
        { error: 'name, email, password, and shopId are required' },
        { status: 400 }
      )
    }

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
        role: Role.SUB_ADMIN,
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
