import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    const contentType = request.headers.get('content-type') || ''

    let name, email, profilePicPath;

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
      return NextResponse.json({ error: 'Unsupported Content-Type. Use multipart/form-data or application/json' }, { status: 415 })
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name
    if (email) dataToUpdate.email = email
    if (profilePicPath) dataToUpdate.profilePic = profilePicPath

    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, profilePic: true },
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
