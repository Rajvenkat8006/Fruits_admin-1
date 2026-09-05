import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import {
  requireAuth,
  requireSuperAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    requireSuperAdmin(requireAuth(request))

    const users = await prisma.user.findMany({
      where: { role: Role.USER },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    return jsonError(error)
  }
}
