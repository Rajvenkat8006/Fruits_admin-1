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

    const cart = await prisma.cart.findMany({
      where: { userId },
      include: { product: true },
    })
    return NextResponse.json(cart)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId, quantity } = await request.json()

    // Fallback: If payload contains userId and we didn't get it from token, maybe allowed? 
    // But getUserId handles headers. 
    // If user sends userId in body, we ignore it to be secure and consistent with Token.
    // If they rely on body userId without token, they will get 401 unless they sent x-user-id header.

    const cartItem = await prisma.cart.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity },
      create: { userId, productId, quantity: quantity || 1 },
      include: { product: true },
    })
    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
