import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const { id: reviewId } = params

        // Check if review exists
        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        })

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        // Check if user already liked
        const existingLike = await prisma.reviewLike.findUnique({
            where: {
                userId_reviewId: {
                    userId: payload.userId,
                    reviewId
                }
            }
        })

        if (existingLike) {
            // Unlike
            await prisma.reviewLike.delete({
                where: { id: existingLike.id }
            })
            return NextResponse.json({ message: 'Unliked', liked: false })
        } else {
            // Like
            await prisma.reviewLike.create({
                data: {
                    userId: payload.userId,
                    reviewId
                }
            })
            return NextResponse.json({ message: 'Liked', liked: true })
        }

    } catch (error) {
        console.error('Error toggling like:', error)
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
}
