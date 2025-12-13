import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    
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
    const { userId, productId } = await request.json()
    const watchlistItem = await prisma.watchlist.create({
      data: { userId, productId },
      include: { product: true },
    })
    return NextResponse.json(watchlistItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 })
  }
}
