import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Fetch user to verify authenticaton
        const user = await prisma.user.findUnique({ where: { id: payload.userId } })
        if (!user) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                image: true // Fixed: schema uses 'image' not 'imageUrl'
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Map response to match frontend expectation if needed, or update frontend
        // Frontend expects 'imageUrl', so let's transform or update frontend. 
        // Safer to transform here to keep frontend stable.
        const formattedOrders = orders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                product: {
                    ...item.product,
                    imageUrl: item.product.image // Map 'image' to 'imageUrl'
                }
            }))
        }))

        return NextResponse.json(formattedOrders)
    } catch (error) {
        console.error('Failed to fetch orders:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({ where: { id: payload.userId } })
        if (!user) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id, status } = await request.json()

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error('Failed to update order:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
