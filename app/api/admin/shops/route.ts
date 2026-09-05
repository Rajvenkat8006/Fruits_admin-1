import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShopStatus } from '@prisma/client'
import {
  requireAuth,
  requireSuperAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    requireSuperAdmin(requireAuth(request))

    const shops = await prisma.shop.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            shopProducts: true,
            orders: true,
          },
        },
        users: {
          where: { role: 'SUB_ADMIN' },
          select: { id: true, name: true, email: true },
          take: 5,
        },
      },
    })

    return NextResponse.json(shops)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSuperAdmin(requireAuth(request))

    const body = await request.json()
    const { name, address, latitude, longitude, phone, status } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        address: address || null,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        phone: phone || null,
        status: status === 'DISABLED' ? ShopStatus.DISABLED : ShopStatus.ACTIVE,
      },
    })

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
