import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { CategoryPageClient } from './category-page-client'

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      parent: true,
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
    },
  })
}

async function getProducts(categoryId: string, filters: any) {
  const where: any = {
    categoryId,
    status: 'ACTIVE',
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {}
    if (filters.minPrice) where.price.gte = filters.minPrice
    if (filters.maxPrice) where.price.lte = filters.maxPrice
  }

  if (filters.inStock) {
    where.inventory = { quantity: { gt: 0 } }
  }

  if (filters.featured) {
    where.featured = true
  }

  if (filters.tags?.length) {
    where.tags = { hasSome: filters.tags }
  }

  let orderBy: any = { createdAt: 'desc' }
  switch (filters.sortBy) {
    case 'price_asc': orderBy = { price: 'asc' }; break
    case 'price_desc': orderBy = { price: 'desc' }; break
    case 'popular': orderBy = { createdAt: 'desc' }; break
    case 'rating': orderBy = { createdAt: 'desc' }; break
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        inventory: true,
        variants: { include: { inventory: true } },
      },
      orderBy,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.product.count({ where }),
  ])

  return { products, total }
}

async function getFilters(categoryId: string) {
  const [priceRange, tags] = await Promise.all([
    prisma.product.aggregate({
      where: { categoryId, status: 'ACTIVE' },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.product.findMany({
      where: { categoryId, status: 'ACTIVE' },
      select: { tags: true },
      distinct: ['tags'],
    }),
  ])

  return {
    priceRange: {
      min: Number(priceRange._min.price || 0),
      max: Number(priceRange._max.price || 0),
    },
    tags: tags.flatMap((p) => p.tags).filter(Boolean),
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'Categoria não encontrada' }
  }

  return {
    title: category.name,
    description: category.description || `Explore a nossa seleção de ${category.name.toLowerCase()}. Produtos premium com envio grátis e garantia oficial.`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const filters = {
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    inStock: sp.inStock === 'true',
    featured: sp.featured === 'true',
    tags: sp.tags ? (Array.isArray(sp.tags) ? sp.tags : [sp.tags]) : undefined,
    sortBy: (sp.sortBy as any) || 'newest',
    page: sp.page ? Number(sp.page) : 1,
    limit: 12,
  }

  const [{ products, total }, filterData, subcategories] = await Promise.all([
    getProducts(category.id, filters),
    getFilters(category.id),
    prisma.category.findMany({
      where: { parentId: category.id, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
    }),
  ])

  const totalPages = Math.ceil(total / filters.limit)

  const categoryData = {
    ...category,
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      images: p.images,
      inventory: p.inventory,
      variants: p.variants.map((v) => ({ ...v, price: v.price ? Number(v.price) : null, inventory: v.inventory })),
    })),
    subcategories: subcategories.map((c) => ({ ...c })),
    filters: filterData,
    pagination: {
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      hasNext: filters.page < totalPages,
      hasPrev: filters.page > 1,
    },
    currentFilters: filters,
  }

  return <CategoryPageClient category={categoryData} />
}