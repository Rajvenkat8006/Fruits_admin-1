import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import {
  requireAuth,
  requireAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    requireAdmin(requireAuth(request))

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = products.map((p) => ({
      ...p,
      imageUrl: p.image || null,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdmin(requireAuth(request))
    // Master catalog create: Super Admin; Sub Admin can also add master products for their listings
    if (auth.role !== Role.SUPER_ADMIN && auth.role !== Role.SUB_ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      slug: incomingSlug,
      description,
      price,
      image,
      imageUrl,
      stock,
      categoryId,
      featured,
    } = body

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'name and categoryId are required' },
        { status: 400 }
      )
    }

    const finalImage = image || imageUrl || ''
    const slug = incomingSlug
      ? String(incomingSlug)
      : String(name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price) || 0,
        image: finalImage,
        stock: parseInt(stock as any) || 0,
        categoryId,
        featured: Boolean(featured),
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
