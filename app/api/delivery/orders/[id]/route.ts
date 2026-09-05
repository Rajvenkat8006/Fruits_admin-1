import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import {
  requireAuth,
  requireRoles,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.DELIVERY_BOY])

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        shop: { select: { id: true, name: true, address: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, image: true } },
          },
        },
        shippingAddress: true,
        payments: true,
      },
    })

    if (!order || order.deliveryBoyId !== auth.userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return jsonError(error)
  }
}
