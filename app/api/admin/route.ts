import { NextRequest } from 'next/server'
import { GET as dashboardGet } from './dashboard/route'

export const dynamic = 'force-dynamic'

/** Back-compat: GET /api/admin → dashboard */
export async function GET(request: NextRequest) {
  return dashboardGet(request)
}
