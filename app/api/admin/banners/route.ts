import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    requireAdmin(requireAuth(request))

    const banners = await prisma.banner.findMany({
      orderBy: { position: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSuperAdmin(requireAuth(request))

    const body = await request.json()
    if (!body.image) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    const banner = await prisma.banner.create({
      data: {
        title: body.title || null,
        image: body.image,
        link: body.link || null,
        position: body.position != null ? Number(body.position) : 0,
        isActive: body.isActive !== false,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    })
    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
