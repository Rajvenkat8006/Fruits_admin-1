import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import { hashPassword } from '@/lib/auth'
import {
  requireAuth,
  requireAdmin,
  assertShopAccess,
  resolveShopId,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAdmin(requireAuth(request))

    const existing = await prisma.user.findUnique({ where: { id: params.id } })
    if (!existing || existing.role !== Role.DELIVERY_BOY) {
      return NextResponse.json({ error: 'Delivery boy not found' }, { status: 404 })
    }

    assertShopAccess(auth, existing.shopId)

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = body.name
    if (body.email !== undefined) data.email = body.email
    if (body.status !== undefined) {
      data.status =
        body.status === 'BLOCKED' ? UserStatus.BLOCKED : UserStatus.ACTIVE
    }
    if (body.shopId !== undefined) {
      const shopId = resolveShopId(auth, body.shopId)
      data.shopId = shopId
    }
    if (body.password) {
      data.password = await hashPassword(body.password)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: selectFields,
    })

    return NextResponse.json(user)
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAdmin(requireAuth(request))

    const existing = await prisma.user.findUnique({ where: { id: params.id } })
    if (!existing || existing.role !== Role.DELIVERY_BOY) {
      return NextResponse.json({ error: 'Delivery boy not found' }, { status: 404 })
    }

    assertShopAccess(auth, existing.shopId)

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: UserStatus.BLOCKED },
      select: selectFields,
    })

    return NextResponse.json({ message: 'Delivery boy deactivated', user })
  } catch (error) {
    return jsonError(error)
  }
}
