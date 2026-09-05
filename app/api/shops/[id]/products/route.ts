import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShopStatus } from '@prisma/client'
import { requireAuth, requireRoles, jsonError } from '@/lib/rbac'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireRoles(requireAuth(request), [
      Role.USER,
      Role.SUPER_ADMIN,
      Role.SUB_ADMIN,
    ])

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        status: true,
        latitude: true,
        longitude: true,
      },
    })

    if (!shop || shop.status !== ShopStatus.ACTIVE) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const products = await prisma.shopProduct.findMany({
      where: {
        shopId: params.id,
        isAvailable: true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            categoryId: true,
            category: { select: { id: true, name: true, slug: true } },
            featured: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      shop,
      products: products.map((sp) => ({
        shopProductId: sp.id,
        productId: sp.productId,
        price: sp.price,
        stock: sp.stock,
        isAvailable: sp.isAvailable,
        ...sp.product,
        imageUrl: sp.product.image,
      })),
    })
  } catch (error) {
    return jsonError(error)
  }
}
