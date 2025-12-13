import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

    const verified = await verifyAuth(token)
    if (!verified) return NextResponse.json({ authenticated: false }, { status: 401 })

    return NextResponse.json({ authenticated: true, payload: verified })
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
