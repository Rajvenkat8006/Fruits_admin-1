import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireAuth,
  requireAdmin,
  resolveShopId,
  shopScopeFilter,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdmin(requireAuth(request))
    const { searchParams } = new URL(request.url)
    const filterShopId = searchParams.get('shopId')

    let where: { shopId?: string } = {}

    if (auth.role === 'SUPER_ADMIN') {
      if (filterShopId) where.shopId = filterShopId
    } else {
      where = shopScopeFilter(auth)
    }

    const items = await prisma.shopProduct.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        },
        shop: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdmin(requireAuth(request))
    const body = await request.json()
    const { productId, price, stock, isAvailable, shopId: requestedShopId } = body

    if (!productId || price == null) {
      return NextResponse.json(
        { error: 'productId and price are required' },
        { status: 400 }
      )
    }

    const shopId = resolveShopId(auth, requestedShopId)

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const item = await prisma.shopProduct.upsert({
      where: {
        shopId_productId: { shopId, productId },
      },
      create: {
        shopId,
        productId,
        price: Number(price),
        stock: stock != null ? Number(stock) : 0,
        isAvailable: isAvailable !== false,
      },
      update: {
        price: Number(price),
        stock: stock != null ? Number(stock) : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      },
      include: {
        product: { select: { id: true, name: true, image: true } },
        shop: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
