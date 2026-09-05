import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import {
  requireAuth,
  requireSuperAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireSuperAdmin(requireAuth(request))

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            shopId: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return jsonError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireSuperAdmin(requireAuth(request))

    const existing = await prisma.user.findUnique({ where: { id: params.id } })
    if (!existing || existing.role !== Role.USER) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const status =
      body.status === 'BLOCKED' ? UserStatus.BLOCKED : UserStatus.ACTIVE

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    })

    return NextResponse.json(user)
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

    await prisma.user.update({
      where: { id: params.id },
      data: { status: UserStatus.BLOCKED },
    })

    return NextResponse.json({ message: 'User blocked' })
  } catch (error) {
    return jsonError(error)
  }
}
