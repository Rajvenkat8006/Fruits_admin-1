import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true },
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, icon, slug: providedSlug } = await request.json()

    // Generate slug if not provided
    const slug = providedSlug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

    const category = await prisma.category.create({ data: { name, icon, slug } })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category', details: (error as Error).message }, { status: 500 })
  }
}
