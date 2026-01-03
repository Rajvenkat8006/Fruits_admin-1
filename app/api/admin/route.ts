import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [totalUsers, totalProducts, totalCategories, totalOrders, revenueData, recentOrdersRaw] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.category.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: {
                    total: true
                }
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            })
        ])

        const totalRevenue = revenueData._sum.total || 0

        // Format recent orders for the dashboard
        const recentOrders = recentOrdersRaw.map(order => ({
            id: order.id,
            user: order.user?.name || order.user?.email || 'Guest',
            amount: order.total,
            status: order.status,
            date: order.createdAt.toISOString()
        }))

        return NextResponse.json({
            totalUsers,
            totalProducts,
            totalCategories,
            totalOrders,
            totalRevenue,
            recentOrders
        })
    } catch (error) {
        console.error('Dashboard Stats Error:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
