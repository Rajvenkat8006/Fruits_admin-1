// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { comparePassword, generateToken } from '@/lib/auth'
// import jwt from 'jsonwebtoken'

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// }

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders })
// }

// export async function POST(request: NextRequest) {
//   try {
//     console.log('🔐 Login attempt started')
//     const body = await request.json()
//     const { email, password } = body

//     console.log('📧 Email:', email)

//     // 1. Check for Hardcoded Admin Credentials
//     const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fruitify.com'
//     const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
//     const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

//     if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
//       console.log('🔐 Admin login detected')
//       // Issue Admin Token
//       const token = jwt.sign({ userId: 'admin-static-id', isAdmin: true, email }, JWT_SECRET, { expiresIn: '7d' })

//       const response = NextResponse.json({
//         token,
//         user: {
//           id: 'admin-static-id',
//           email: ADMIN_EMAIL,
//           name: 'Administrator',
//         },
//         message: 'Admin Login successful'
//       }, { headers: corsHeaders })

//       // Set Cookie for Middleware
//       response.cookies.set('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         path: '/',
//         maxAge: 60 * 60 * 24 * 7 // 7 days
//       })

//       return response
//     }


//     if (!email || !password) {
//       console.log('❌ Missing email or password')
//       return NextResponse.json(
//         { error: 'Missing email or password' },
//         { status: 400, headers: corsHeaders }
//       )
//     }

//     console.log('🔍 Looking up user in database...')
//     const user = await prisma.user.findUnique({ where: { email } })

//     if (!user) {
//       console.log('❌ User not found:', email)
//       return NextResponse.json(
//         { error: 'Invalid credentials - user not found' },
//         { status: 401, headers: corsHeaders }
//       )
//     }

//     console.log('✅ User found:', user.email)
//     console.log('🔑 Verifying password...')

//     const isValid = await comparePassword(password, user.password)

//     if (!isValid) {
//       console.log('❌ Invalid password')
//       return NextResponse.json(
//         { error: 'Invalid credentials - wrong password' },
//         { status: 401, headers: corsHeaders }
//       )
//     }

//     console.log('✅ Password verified')
//     console.log('🎫 Generating token...')

//     const token = generateToken(user.id)

//     console.log('✅ Login successful for:', user.email)

//     const response = NextResponse.json({
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//       },
//       message: 'Login successful'
//     }, { headers: corsHeaders })

//     // Set Cookie for User (optional, but consistent)
//     response.cookies.set('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       path: '/',
//       maxAge: 60 * 60 * 24 * 7
//     })

//     return response

//   } catch (error: any) {
//     console.error('💥 LOGIN API ERROR:', error)
//     console.error('Error stack:', error.stack)

//     return NextResponse.json(
//       {
//         error: 'Login failed',
//         details: error.message || error.toString(),
//         type: error.name || 'Unknown error'
//       },
//       { status: 500, headers: corsHeaders }
//     )
//   }
// }


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt started')
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('🔍 Looking up user:', email)

    // Check user in database
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials - user not found' },
        { status: 401, headers: corsHeaders }
      )
    }

    console.log('🔑 Checking password...')
    const isValid = await comparePassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials - incorrect password' },
        { status: 401, headers: corsHeaders }
      )
    }

    console.log('🎫 Generating JWT...')
    // Temporary Admin Check Logic until RBAC database schema is fully active
    const isAdmin = user.email === 'admin@fruitify.com' || user.email === 'sai@gmail.com'
    const token = generateToken(user.id, isAdmin)

    const response = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        message: 'Login successful',
      },
      { headers: corsHeaders }
    )

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error: any) {
    console.error('💥 LOGIN API ERROR:', error)

    return NextResponse.json(
      {
        error: 'Login failed',
        details: error.message || 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
