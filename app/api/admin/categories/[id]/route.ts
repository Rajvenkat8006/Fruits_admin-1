import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveFile } from '@/lib/upload'
import {
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(requireAuth(request))

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { products: true },
    })
    if (!category) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(category)
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

    const contentType = request.headers.get('content-type') || ''
    const data: { name?: string; slug?: string; icon?: string | null } = {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const name = formData.get('name') as string | null
      const slug = formData.get('slug') as string | null
      const iconUrl = formData.get('iconUrl') as string | null
      const file = formData.get('icon') as File | null

      if (name) {
        data.name = name.trim()
        data.slug = slug || slugify(name)
      } else if (slug) {
        data.slug = slug
      }

      if (file && file.size > 0) {
        data.icon = await saveFile(file)
      } else if (iconUrl !== null && iconUrl !== undefined) {
        data.icon = iconUrl || null
      }
    } else {
      const body = await request.json()
      if (body.name !== undefined) {
        data.name = body.name
        if (!body.slug) data.slug = slugify(String(body.name))
      }
      if (body.slug !== undefined) data.slug = body.slug
      if (body.icon !== undefined) data.icon = body.icon
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(category)
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
    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return jsonError(error)
  }
}
