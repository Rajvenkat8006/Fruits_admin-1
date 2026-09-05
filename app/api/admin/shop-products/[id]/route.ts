import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireAuth,
  requireAdmin,
  assertShopAccess,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAdmin(requireAuth(request))

    const existing = await prisma.shopProduct.findUnique({
      where: { id: params.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Shop product not found' }, { status: 404 })
    }

    assertShopAccess(auth, existing.shopId)

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.price !== undefined) data.price = Number(body.price)
    if (body.stock !== undefined) data.stock = Number(body.stock)
    if (body.isAvailable !== undefined) data.isAvailable = Boolean(body.isAvailable)

    const item = await prisma.shopProduct.update({
      where: { id: params.id },
      data,
      include: {
        product: { select: { id: true, name: true, image: true } },
        shop: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(item)
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

    const existing = await prisma.shopProduct.findUnique({
      where: { id: params.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Shop product not found' }, { status: 404 })
    }

    assertShopAccess(auth, existing.shopId)

    await prisma.shopProduct.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Shop product removed' })
  } catch (error) {
    return jsonError(error)
  }
}
