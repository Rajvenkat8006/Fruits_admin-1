import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({ include: { category: true } })

    // Map product.image -> imageUrl for frontend consistency
    const formatted = products.map((p: any) => ({
      ...p,
      imageUrl: p.image || null,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      slug: incomingSlug,
      description,
      price,
      image,
      imageUrl,
      stock,
      categoryId,
    } = body

    // Accept imageUrl from frontend and map to image
    const finalImage = image || imageUrl || ''

    // Generate slug if not provided
    const slug = incomingSlug
      ? String(incomingSlug)
      : String(name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price) || 0,
        image: finalImage,
        stock: parseInt(stock as any) || 0,
        categoryId,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
