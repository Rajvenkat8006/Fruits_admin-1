import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import {
  requireAuth,
  requireAdmin,
  assertShopAccess,
  shopScopeFilter,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

const ADMIN_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.ASSIGNED,
  OrderStatus.CANCELLED,
  OrderStatus.PROCESSING,
  OrderStatus.PAID,
  OrderStatus.FULFILLED,
  OrderStatus.DELIVERED,
  OrderStatus.REFUNDED,
]

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdmin(requireAuth(request))
    const scope = shopScopeFilter(auth)

    const orders = await prisma.order.findMany({
      where: scope,
      include: {
        user: { select: { name: true, email: true } },
        shop: { select: { id: true, name: true } },
        deliveryBoy: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: { name: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedOrders = orders.map((order) => ({
      ...order,
      user: order.user || { name: 'Unknown User', email: 'N/A' },
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, imageUrl: item.product.image }
          : { name: 'Product Deleted', image: null, imageUrl: null },
      })),
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    return jsonError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAdmin(requireAuth(request))
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!ADMIN_STATUS_FLOW.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    assertShopAccess(auth, existing.shopId)

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(order)
  } catch (error) {
    return jsonError(error)
  }
}
