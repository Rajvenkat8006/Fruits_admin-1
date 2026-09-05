import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, jsonError } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

/**
 * Mobile home categories (USER-safe).
 * Returns id, name, slug, icon for circular chips.
 */
export async function GET(request: NextRequest) {
  try {
    requireAuth(request)

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    return jsonError(error)
  }
}
