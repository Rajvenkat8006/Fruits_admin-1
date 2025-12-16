import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bannerUpdateSchema = z.object({
    title: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional(),
    position: z.number().int().optional(),
    isActive: z.boolean().optional(),
    startDate: z.string().optional().nullable().transform((str) => str ? new Date(str) : null), // Handle nullable updates
    endDate: z.string().optional().nullable().transform((str) => str ? new Date(str) : null),
})

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const banner = await prisma.banner.findUnique({
            where: { id: params.id },
        })

        if (!banner) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
        }

        return NextResponse.json(banner)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()

        // Validate request body
        const validation = bannerUpdateSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 })
        }

        const banner = await prisma.banner.update({
            where: { id: params.id },
            data: validation.data,
        })

        return NextResponse.json(banner)
    } catch (error) {
        console.error('Error updating banner:', error)
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.banner.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: 'Banner deleted successfully' })
    } catch (error) {
        console.error('Error deleting banner:', error)
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
    }
}
