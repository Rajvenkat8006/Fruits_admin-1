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

export async function GET(request: NextRequest) {
  try {
    requireAdmin(requireAuth(request))

    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSuperAdmin(requireAuth(request))

    const contentType = request.headers.get('content-type') || ''
    let name: string | undefined
    let icon: string | null = null
    let providedSlug: string | undefined

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      name = String(formData.get('name') || '')
      providedSlug = (formData.get('slug') as string) || undefined
      const iconUrl = formData.get('iconUrl') as string | null
      const file = formData.get('icon') as File | null

      if (file && file.size > 0) {
        icon = await saveFile(file)
      } else if (iconUrl) {
        icon = iconUrl
      }
    } else {
      const body = await request.json()
      name = body.name
      providedSlug = body.slug
      icon = body.icon || null
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const slug = providedSlug || slugify(name)

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        icon,
        slug,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
