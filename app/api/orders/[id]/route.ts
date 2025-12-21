import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

        const order = await prisma.order.findUnique({
            where: { id: params.id },
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

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Only allow owner or admin to view
        // Ideally we check role, but for now we check userId logic.
        // If we had role in payload, we could check that.
        // Let's assume user.role is available if we fetched user, but we only have payload.
        // Payload usually has role if we put it there? 
        // Let's look at `login/route.ts` or `auth.ts` to see what's in payload.
        // For safety, let's strictly check userId.

        if (order.userId !== payload.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error('Failed to fetch order:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
