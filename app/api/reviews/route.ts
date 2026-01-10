import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'


const reviewSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        // Authenticate User
        let token = request.cookies.get('token')?.value
        if (!token) {
            const authHeader = request.headers.get('Authorization')
            if (authHeader) {
                token = authHeader.replace(/^Bearer\s+/, '')
            }
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const body = await request.json()

        // Validate Request Body
        const validation = reviewSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 })
        }

        const { productId, rating, comment } = validation.data

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: payload.userId,
                    productId: productId
                }
            }
        })

        if (existingReview) {
            return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
        }

        // Create Review
        const review = await prisma.review.create({
            data: {
                userId: payload.userId,
                productId,
                rating,
                comment,
            }
        })

        return NextResponse.json(review, { status: 201 })
    } catch (error) {
        console.error('Error creating review:', error)
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePic: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(reviews)
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}
