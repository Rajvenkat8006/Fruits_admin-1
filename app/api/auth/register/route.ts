import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { Role, UserStatus } from '@prisma/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Invalid JSON', details: err.message },
        { status: 400, headers: corsHeaders }
      )
    }

    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400, headers: corsHeaders }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409, headers: corsHeaders }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: Role.USER,
        status: UserStatus.ACTIVE,
      },
    })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Registration successful. Please login.',
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
