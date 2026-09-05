import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, Role } from '@prisma/client'
import {
  requireAuth,
  requireRoles,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.DELIVERY_BOY])
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: {
      deliveryBoyId: string
      status?: OrderStatus | { in: OrderStatus[] }
    } = {
      deliveryBoyId: auth.userId,
    }

    if (status === 'active') {
      where.status = {
        in: [
          OrderStatus.ASSIGNED,
          OrderStatus.PICKED_UP,
          OrderStatus.OUT_FOR_DELIVERY,
        ],
      }
    } else if (status === 'completed') {
      where.status = OrderStatus.DELIVERED
    } else if (status) {
      where.status = status as OrderStatus
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        shop: { select: { id: true, name: true, address: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, image: true } },
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    return jsonError(error)
  }
}
