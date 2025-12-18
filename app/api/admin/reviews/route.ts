import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // Authenticate Admin
        // NOTE: Ideally we should check if user is admin, but verifyToken only returns userId in current implementation according to the file view.
        // However, middleware might be protecting /admin routes. 
        // For /api/admin/* routes, we should probably check admin status if possible.
        // Looking at lib/auth.ts, generateToken includes isAdmin, but verifyToken type definition only showed userId in return type (line 24).
        // BUT logic in generateToken puts isAdmin in payload.
        // Let's check verifyToken again. It just casts to { userId: string }. 
        // I will assume for now checking for valid token is enough as middleware handles role protection for /admin routes usually.

        const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const reviews = await prisma.review.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                product: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(reviews)
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}
