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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.USER])

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        shop: { select: { id: true, name: true, phone: true } },
        deliveryBoy: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { name: true, image: true } },
          },
        },
        shippingAddress: true,
        payments: true,
      },
    })

    if (!order || order.userId !== auth.userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return jsonError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.USER])
    const body = await request.json()

    const order = await prisma.order.findUnique({ where: { id: params.id } })
    if (!order || order.userId !== auth.userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Users may cancel only early statuses
    if (body.status === OrderStatus.CANCELLED) {
      const cancellable: OrderStatus[] = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
      ]
      if (!cancellable.includes(order.status)) {
        throw new ApiError('Order cannot be cancelled now', 400)
      }

      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { status: OrderStatus.CANCELLED },
      })
      return NextResponse.json(updated)
    }

    throw new ApiError('Unsupported update', 400)
  } catch (error) {
    return jsonError(error)
  }
}
