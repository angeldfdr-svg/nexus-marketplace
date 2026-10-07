import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query.trim()) {
      return NextResponse.json({ products: [], categories: [], total: 0, query: '' })
    }

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean)

    const where: any = {
      status: 'ACTIVE',
      OR: searchTerms.map((term) => ({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { shortDesc: { contains: term, mode: 'insensitive' } },
          { tags: { hasSome: [term] } },
          { sku: { contains: term, mode: 'insensitive' } },
        ],
      })),
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { position: 'asc' }, take: 1 },
          inventory: true,
          category: true,
          _count: { select: { reviews: true } },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
          OR: searchTerms.map((term) => ({
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
            ],
          })),
        },
        include: {
          _count: { select: { products: { where: { status: 'ACTIVE' } } } },
        },
        take: 10,
      }),
    ])

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      })),
      categories,
      total: products.length,
      query,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Erro na pesquisa' }, { status: 500 })
  }
}