import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    
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
    const { userId, productId, quantity } = await request.json()
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
