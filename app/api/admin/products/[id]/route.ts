import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(requireAuth(request))

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ ...product, imageUrl: product.image })
  } catch (error) {
    return jsonError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireSuperAdmin(requireAuth(request))

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = body.name
    if (body.slug !== undefined) data.slug = body.slug
    if (body.description !== undefined) data.description = body.description
    if (body.price !== undefined) data.price = parseFloat(body.price)
    if (body.image !== undefined || body.imageUrl !== undefined) {
      data.image = body.image || body.imageUrl
    }
    if (body.stock !== undefined) data.stock = parseInt(body.stock)
    if (body.categoryId !== undefined) data.categoryId = body.categoryId
    if (body.featured !== undefined) data.featured = Boolean(body.featured)

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(product)
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireSuperAdmin(requireAuth(request))
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return jsonError(error)
  }
}
