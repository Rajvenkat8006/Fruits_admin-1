import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, Role } from '@prisma/client'
import {
  requireAuth,
  requireRoles,
  jsonError,
  ApiError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

const DELIVERY_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.ASSIGNED]: [OrderStatus.PICKED_UP],
  [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.DELIVERY_BOY])
    const body = await request.json()
    const nextStatus = body.status as OrderStatus

    if (!nextStatus) {
      throw new ApiError('status is required', 400)
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } })
    if (!order || order.deliveryBoyId !== auth.userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const allowed = DELIVERY_TRANSITIONS[order.status] || []
    if (!allowed.includes(nextStatus)) {
      throw new ApiError(
        `Cannot change status from ${order.status} to ${nextStatus}`,
        400
      )
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: nextStatus },
      include: {
        user: { select: { id: true, name: true } },
        shippingAddress: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return jsonError(error)
  }
}
