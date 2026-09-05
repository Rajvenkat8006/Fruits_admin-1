import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRoles, jsonError } from '@/lib/rbac'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.USER])
    const { quantity } = await request.json()

    const existing = await prisma.cart.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (quantity <= 0) {
      await prisma.cart.delete({ where: { id: params.id } })
      return NextResponse.json({ message: 'Removed' })
    }

    const item = await prisma.cart.update({
      where: { id: params.id },
      data: { quantity },
      include: { product: true },
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
    const auth = requireRoles(requireAuth(request), [Role.USER])

    const existing = await prisma.cart.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.cart.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Removed' })
  } catch (error) {
    return jsonError(error)
  }
}
