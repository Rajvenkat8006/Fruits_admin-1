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

    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
    })

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json(banner)
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

    if (body.title !== undefined) data.title = body.title
    if (body.image !== undefined) data.image = body.image
    if (body.link !== undefined) data.link = body.link
    if (body.position !== undefined) data.position = Number(body.position)
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)
    if (body.startDate !== undefined) {
      data.startDate = body.startDate ? new Date(body.startDate) : null
    }
    if (body.endDate !== undefined) {
      data.endDate = body.endDate ? new Date(body.endDate) : null
    }

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(banner)
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
    await prisma.banner.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Banner deleted successfully' })
  } catch (error) {
    return jsonError(error)
  }
}
