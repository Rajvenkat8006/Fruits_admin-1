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
    const auth = requireRoles(requireAuth(request), [
      Role.USER,
      Role.DELIVERY_BOY,
      Role.SUB_ADMIN,
      Role.SUPER_ADMIN,
    ])

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
        createdAt: true,
        shop: { select: { id: true, name: true } },
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

export async function PUT(request: NextRequest) {
  try {
    const auth = requireRoles(requireAuth(request), [
      Role.USER,
      Role.DELIVERY_BOY,
      Role.SUB_ADMIN,
      Role.SUPER_ADMIN,
    ])

    const contentType = request.headers.get('content-type') || ''
    let name: string | undefined
    let email: string | undefined
    let profilePicPath: string | undefined

    if (contentType.includes('application/json')) {
      const body = await request.json()
      name = body.name
      email = body.email
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      name = formData.get('name') as string
      email = formData.get('email') as string
      const file = formData.get('profilePic') as File | null
      if (file) {
        const { saveFile } = await import('@/lib/upload')
        profilePicPath = await saveFile(file)
      }
    } else {
      return NextResponse.json(
        {
          error:
            'Unsupported Content-Type. Use multipart/form-data or application/json',
        },
        { status: 415 }
      )
    }

    const dataToUpdate: Record<string, unknown> = {}
    if (name) dataToUpdate.name = name
    if (email) dataToUpdate.email = email
    if (profilePicPath) dataToUpdate.profilePic = profilePicPath

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        role: true,
        shopId: true,
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return jsonError(error)
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request)
}
