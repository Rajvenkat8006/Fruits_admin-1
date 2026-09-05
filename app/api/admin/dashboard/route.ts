import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role, OrderStatus, ShopStatus } from '@prisma/client'
import {
  requireAuth,
  requireAdmin,
  shopScopeFilter,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdmin(requireAuth(request))
    const scope = shopScopeFilter(auth)

    if (auth.role === Role.SUPER_ADMIN) {
      const [
        totalShops,
        activeShops,
        totalUsers,
        totalDeliveryBoys,
        totalProducts,
        totalOrders,
        revenueData,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        recentOrdersRaw,
      ] = await Promise.all([
        prisma.shop.count(),
        prisma.shop.count({ where: { status: ShopStatus.ACTIVE } }),
        prisma.user.count({ where: { role: Role.USER } }),
        prisma.user.count({ where: { role: Role.DELIVERY_BOY } }),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.order.count({
          where: {
            status: {
              in: [
                OrderStatus.PENDING,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.ASSIGNED,
              ],
            },
          },
        }),
        prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
        prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            shop: { select: { name: true } },
          },
        }),
      ])

      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const [todayOrders, todayRevenue] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.order.aggregate({
          where: { createdAt: { gte: startOfDay } },
          _sum: { total: true },
        }),
      ])

      return NextResponse.json({
        role: auth.role,
        totalShops,
        activeShops,
        totalUsers,
        totalDeliveryBoys,
        totalProducts,
        totalOrders,
        totalRevenue: revenueData._sum.total || 0,
        todayOrders,
        todayRevenue: todayRevenue._sum.total || 0,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        recentOrders: recentOrdersRaw.map((order) => ({
          id: order.id,
          user: order.user?.name || order.user?.email || 'Guest',
          shop: order.shop?.name || null,
          amount: order.total,
          status: order.status,
          date: order.createdAt.toISOString(),
        })),
      })
    }

    // SUB_ADMIN scoped dashboard
    const shopId = scope.shopId!

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [
      todayOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      deliveredOrders,
      todaySales,
      lowStock,
      activeDeliveryBoys,
      recentOrdersRaw,
    ] = await Promise.all([
      prisma.order.count({
        where: { shopId, createdAt: { gte: startOfDay } },
      }),
      prisma.order.count({
        where: {
          shopId,
          status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
        },
      }),
      prisma.order.count({
        where: { shopId, status: OrderStatus.PREPARING },
      }),
      prisma.order.count({
        where: { shopId, status: OrderStatus.READY },
      }),
      prisma.order.count({
        where: { shopId, status: OrderStatus.DELIVERED },
      }),
      prisma.order.aggregate({
        where: { shopId, createdAt: { gte: startOfDay } },
        _sum: { total: true },
      }),
      prisma.shopProduct.count({
        where: { shopId, stock: { lte: 10 }, isAvailable: true },
      }),
      prisma.user.count({
        where: {
          shopId,
          role: Role.DELIVERY_BOY,
          status: 'ACTIVE',
        },
      }),
      prisma.order.findMany({
        take: 5,
        where: { shopId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ])

    return NextResponse.json({
      role: auth.role,
      shopId,
      todayOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      deliveredOrders,
      todaySales: todaySales._sum.total || 0,
      lowStock,
      activeDeliveryBoys,
      recentOrders: recentOrdersRaw.map((order) => ({
        id: order.id,
        user: order.user?.name || order.user?.email || 'Guest',
        amount: order.total,
        status: order.status,
        date: order.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return jsonError(error)
  }
}
