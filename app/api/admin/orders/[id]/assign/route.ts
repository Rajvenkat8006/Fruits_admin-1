import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, Role, UserStatus } from '@prisma/client'
import {
  requireAuth,
  requireAdmin,
  assertShopAccess,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAdmin(requireAuth(request))
    const body = await request.json()
    const { deliveryBoyId } = body

    if (!deliveryBoyId) {
      return NextResponse.json(
        { error: 'deliveryBoyId is required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    assertShopAccess(auth, order.shopId)

    const boy = await prisma.user.findUnique({ where: { id: deliveryBoyId } })
    if (
      !boy ||
      boy.role !== Role.DELIVERY_BOY ||
      boy.status !== UserStatus.ACTIVE
    ) {
      return NextResponse.json(
        { error: 'Invalid delivery boy' },
        { status: 400 }
      )
    }

    if (order.shopId && boy.shopId !== order.shopId) {
      return NextResponse.json(
        { error: 'Delivery boy must belong to the same shop' },
        { status: 403 }
      )
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        deliveryBoyId,
        status: OrderStatus.ASSIGNED,
      },
      include: {
        deliveryBoy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return jsonError(error)
  }
}
