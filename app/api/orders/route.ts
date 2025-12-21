import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1]

        // Also check cookie if header is missing, consistent with other routes
        const cookieToken = request.cookies.get('token')?.value
        const validToken = token || cookieToken

        if (!validToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(validToken)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const orders = await prisma.order.findMany({
            where: { userId: payload.userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(orders)
    } catch (error) {
        console.error('Failed to fetch orders:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1]
        const cookieToken = request.cookies.get('token')?.value
        const validToken = token || cookieToken

        if (!validToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(validToken)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const userId = payload.userId

        // 1. Get user's cart
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: { product: true }
        })

        if (!cartItems.length) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
        }

        // 2. Calculate total
        const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

        // 3. Create Order in Transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    status: 'PENDING',
                    items: {
                        create: cartItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price
                        }))
                    }
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    }
                }
            })

            // Clear Cart
            await tx.cart.deleteMany({
                where: { userId }
            })

            return newOrder
        })

        return NextResponse.json(order, { status: 201 })
    } catch (error) {
        console.error('Failed to create order:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
