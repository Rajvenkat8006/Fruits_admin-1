import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import {
  requireAuth,
  requireRoles,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = requireRoles(requireAuth(request), [Role.DELIVERY_BOY])

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        role: true,
        status: true,
        shopId: true,
        shop: {
          select: { id: true, name: true, address: true, phone: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return jsonError(error)
  }
}
