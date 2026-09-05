import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import {
  requireAuth,
  requireRoles,
  jsonError,
  ApiError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.USER])

    const cart = await prisma.cart.findMany({
      where: { userId: auth.userId },
      include: {
        product: true,
        shop: { select: { id: true, name: true } },
      },
      orderBy: { addedAt: 'desc' },
    })

    return NextResponse.json(cart)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.USER])
    const body = await request.json()
    const { productId, shopId, quantity = 1, shopProductId } = body

    if (!productId || !shopId) {
      throw new ApiError('productId and shopId are required', 400)
    }

    const shopProduct = shopProductId
      ? await prisma.shopProduct.findUnique({ where: { id: shopProductId } })
      : await prisma.shopProduct.findUnique({
          where: { shopId_productId: { shopId, productId } },
        })

    if (!shopProduct || !shopProduct.isAvailable) {
      throw new ApiError('Product not available in this shop', 400)
    }

    if (shopProduct.stock < quantity) {
      throw new ApiError('Insufficient stock', 400)
    }

    // Enforce single-shop cart
    const existingOtherShop = await prisma.cart.findFirst({
      where: {
        userId: auth.userId,
        NOT: { shopId },
      },
    })
    if (existingOtherShop) {
      throw new ApiError(
        'Cart has items from another shop. Clear cart first.',
        409
      )
    }

    const cartItem = await prisma.cart.upsert({
      where: {
        userId_productId_shopId: {
          userId: auth.userId,
          productId,
          shopId,
        },
      },
      update: {
        quantity,
        shopProductId: shopProduct.id,
      },
      create: {
        userId: auth.userId,
        productId,
        shopId,
        shopProductId: shopProduct.id,
        quantity: quantity || 1,
      },
      include: { product: true, shop: { select: { id: true, name: true } } },
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.USER])
    await prisma.cart.deleteMany({ where: { userId: auth.userId } })
    return NextResponse.json({ message: 'Cart cleared' })
  } catch (error) {
    return jsonError(error)
  }
}
