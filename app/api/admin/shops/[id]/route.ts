import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShopStatus } from '@prisma/client'
import {
  requireAuth,
  requireSuperAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireSuperAdmin(requireAuth(request))

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: {
            shopProducts: true,
            orders: true,
          },
        },
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    return NextResponse.json(shop)
  } catch (error) {
    return jsonError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireSuperAdmin(requireAuth(request))

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = body.name
    if (body.address !== undefined) data.address = body.address
    if (body.phone !== undefined) data.phone = body.phone
    if (body.latitude !== undefined) data.latitude = Number(body.latitude)
    if (body.longitude !== undefined) data.longitude = Number(body.longitude)
    if (body.status !== undefined) {
      data.status =
        body.status === 'DISABLED' ? ShopStatus.DISABLED : ShopStatus.ACTIVE
    }

    const shop = await prisma.shop.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(shop)
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireSuperAdmin(requireAuth(request))

    const shop = await prisma.shop.update({
      where: { id: params.id },
      data: { status: ShopStatus.DISABLED },
    })

    return NextResponse.json({ message: 'Shop disabled', shop })
  } catch (error) {
    return jsonError(error)
  }
}
