import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [totalUsers, totalProducts, totalCategories, totalOrders] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.category.count(),
            prisma.order.count(),
        ])

        return NextResponse.json({
            totalUsers,
            totalProducts,
            totalCategories,
            totalOrders,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
