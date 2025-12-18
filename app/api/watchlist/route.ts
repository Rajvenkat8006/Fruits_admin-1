import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.split(' ')[1] || request.cookies.get('token')?.value
  if (token) {
    const payload = verifyToken(token)
    if (payload?.userId) return payload.userId
  }
  return request.headers.get('x-user-id')
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: { product: true },
    })
    return NextResponse.json(watchlist)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId } = await request.json()
    const watchlistItem = await prisma.watchlist.create({
      data: { userId, productId },
      include: { product: true },
    })
    return NextResponse.json(watchlistItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 })
  }
}
