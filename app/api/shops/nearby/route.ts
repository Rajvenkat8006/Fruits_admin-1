import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShopStatus } from '@prisma/client'
import { requireAuth, requireRoles, jsonError } from '@/lib/rbac'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: NextRequest) {
  try {
    requireRoles(requireAuth(request), [Role.USER, Role.SUPER_ADMIN, Role.SUB_ADMIN])

    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '')
    const lng = parseFloat(searchParams.get('lng') || '')
    const radiusKm = parseFloat(searchParams.get('radiusKm') || '20')

    const shops = await prisma.shop.findMany({
      where: { status: ShopStatus.ACTIVE },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        latitude: true,
        longitude: true,
        status: true,
      },
    })

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const withDistance = shops
        .map((shop) => {
          if (shop.latitude == null || shop.longitude == null) {
            return { ...shop, distanceKm: null as number | null }
          }
          const distanceKm = haversineKm(lat, lng, shop.latitude, shop.longitude)
          return { ...shop, distanceKm }
        })
        .filter(
          (s) => s.distanceKm == null || s.distanceKm <= radiusKm
        )
        .sort((a, b) => {
          if (a.distanceKm == null) return 1
          if (b.distanceKm == null) return 1
          return a.distanceKm - b.distanceKm
        })

      return NextResponse.json(withDistance)
    }

    return NextResponse.json(shops.map((s) => ({ ...s, distanceKm: null })))
  } catch (error) {
    return jsonError(error)
  }
}
