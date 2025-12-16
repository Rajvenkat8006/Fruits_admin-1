import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Define validation schema for Banner
const bannerSchema = z.object({
    title: z.string().optional(),
    image: z.string().min(1, 'Image URL is required'),
    link: z.string().optional(),
    position: z.number().int().default(0),
    isActive: z.boolean().default(true),
    startDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
    endDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
})

export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { position: 'asc' },
        })
        return NextResponse.json(banners)
    } catch (error) {
        console.error('Error fetching banners:', error)
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate request body
        const validation = bannerSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 })
        }

        const { title, image, link, position, isActive, startDate, endDate } = validation.data

        const banner = await prisma.banner.create({
            data: {
                title,
                image,
                link,
                position,
                isActive,
                startDate,
                endDate,
            },
        })
        return NextResponse.json(banner, { status: 201 })
    } catch (error) {
        console.error('Error creating banner:', error)
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
    }
}
