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

export async function GET(request: NextRequest) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.USER])

    const orders = await prisma.order.findMany({
      where: { userId: auth.userId },
      include: {
        shop: { select: { id: true, name: true } },
        deliveryBoy: { select: { id: true, name: true } },
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

export async function POST(request: NextRequest) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.USER])
    const userId = auth.userId

    let body
    try {
      body = await request.json()
    } catch {
      throw new ApiError('Invalid JSON body', 400)
    }

    const { couponCode, shippingAddress, paymentMethod, shopId: bodyShopId } =
      body

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true },
    })

    if (!cartItems.length) {
      throw new ApiError('Cart is empty', 400)
    }

    const shopIds = Array.from(
      new Set(
        cartItems
          .map((c) => c.shopId)
          .filter((id): id is string => Boolean(id))
      )
    )

    if (shopIds.length !== 1) {
      throw new ApiError('Cart must contain items from exactly one shop', 400)
    }

    const shopId = bodyShopId || shopIds[0]
    if (shopId !== shopIds[0]) {
      throw new ApiError('shopId does not match cart shop', 400)
    }

    // Validate shop product stock & prices
    const linePrices: { productId: string; quantity: number; price: number; shopProductId: string }[] = []

    for (const item of cartItems) {
      const sp = item.shopProductId
        ? await prisma.shopProduct.findUnique({ where: { id: item.shopProductId } })
        : await prisma.shopProduct.findUnique({
            where: {
              shopId_productId: {
                shopId,
                productId: item.productId,
              },
            },
          })

      if (!sp || !sp.isAvailable) {
        throw new ApiError(
          `Product unavailable: ${item.product.name}`,
          400
        )
      }
      if (sp.stock < item.quantity) {
        throw new ApiError(
          `Insufficient stock for ${item.product.name}. Available: ${sp.stock}`,
          400
        )
      }

      linePrices.push({
        productId: item.productId,
        quantity: item.quantity,
        price: sp.price,
        shopProductId: sp.id,
      })
    }

    let total = linePrices.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    let couponId: string | null = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      })

      if (!coupon) {
        throw new ApiError('Coupon not found', 404)
      }

      const now = new Date()
      const isValid =
        coupon.isActive &&
        (!coupon.expiryDate || new Date(coupon.expiryDate) > now) &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)

      if (!isValid) {
        throw new ApiError('Invalid or expired coupon', 400)
      }

      couponId = coupon.id
      const discountAmount =
        coupon.discountType === 'PERCENTAGE'
          ? (total * coupon.value) / 100
          : coupon.value
      total = Math.max(0, total - discountAmount)
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const line of linePrices) {
        await tx.shopProduct.update({
          where: { id: line.shopProductId },
          data: { stock: { decrement: line.quantity } },
        })
      }

      const newOrder = await tx.order.create({
        data: {
          userId,
          shopId,
          total,
          status: OrderStatus.PENDING,
          couponId,
          items: {
            create: linePrices.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })

      if (shippingAddress) {
        await tx.shippingAddress.create({
          data: {
            ...shippingAddress,
            orderId: newOrder.id,
          },
        })
      }

      if (paymentMethod) {
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            method: paymentMethod,
            amount: total,
            status: 'PENDING',
            gateway: 'SYSTEM',
          },
        })
      }

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      await tx.cart.deleteMany({ where: { userId } })

      return newOrder
    })

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        shop: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { name: true, image: true } },
          },
        },
        shippingAddress: true,
        payments: true,
        coupon: true,
      },
    })

    return NextResponse.json(fullOrder, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
