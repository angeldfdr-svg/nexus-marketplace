import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const status = searchParams.get('status') || 'ACTIVE'
    const sortBy = searchParams.get('sortBy') || 'newest'
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status) where.status = status
    if (category) where.category = { slug: category }
    if (featured) where.featured = true
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'price_asc': orderBy = { price: 'asc' }; break
      case 'price_desc': orderBy = { price: 'desc' }; break
      case 'popular': orderBy = { createdAt: 'desc' }; break
      case 'rating': orderBy = { createdAt: 'desc' }; break
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1 },
          inventory: true,
          variants: { include: { inventory: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, slug, description, shortDesc, sku, price, compareAtPrice, costPrice,
      categoryId, images, variants, specifications, tags, featured, requiresShipping,
      weight, dimensions, metaTitle, metaDescription, status
    } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        shortDesc,
        sku,
        price,
        compareAtPrice,
        costPrice,
        categoryId,
        featured: featured || false,
        requiresShipping: requiresShipping !== false,
        weight,
        dimensions,
        metaTitle,
        metaDescription,
        specifications,
        tags: tags || [],
        status: status || 'DRAFT',
        images: images ? { create: images } : undefined,
        variants: variants ? { create: variants } : undefined,
        inventory: { create: { quantity: 0, trackQuantity: true } },
      },
      include: {
        category: true,
        images: true,
        variants: { include: { inventory: true } },
        inventory: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}