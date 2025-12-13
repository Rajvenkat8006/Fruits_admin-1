import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Registration attempt started')

    // Parse request body
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

    // Check if user exists
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({ where: { email } })
    } catch (err: any) {
      return NextResponse.json(
        {
          error: 'Database error',
          details: err.message,
        },
        { status: 500, headers: corsHeaders }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409, headers: corsHeaders }
      )
    }

    // Hash password
    let hashedPassword
    try {
      hashedPassword = await hashPassword(password)
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Password hashing failed', details: err.message },
        { status: 500, headers: corsHeaders }
      )
    }

    // Create user
    let user
    try {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      })
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Database insert failed', details: err.message },
        { status: 500, headers: corsHeaders }
      )
    }

    // Optional: token generation test
    try {
      generateToken(user.id)
    } catch (err) {
      console.error("Token generation failed (ignored):", err)
    }

    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name },
        message: 'Registration successful. Please login.',
      },
      { status: 201, headers: corsHeaders }
    )

  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Registration failed',
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
