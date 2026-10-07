import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import prisma from '@/lib/prisma'
import { ProductDetailClient } from './product-detail-client'

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, status: 'ACTIVE' },
    include: {
      category: true,
      images: { orderBy: { position: 'asc' } },
      variants: {
        include: { inventory: true },
        orderBy: { name: 'asc' },
      },
      inventory: true,
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: { reviews: true },
      },
    },
  })
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: {
      categoryId,
      status: 'ACTIVE',
      NOT: { id: excludeId },
    },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      inventory: true,
    },
    take: 4,
  })
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: 'Produto não encontrado' }
  }

  return {
    title: product.name,
    description: product.shortDesc || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDesc || product.description.slice(0, 160),
      images: product.images[0]?.url ? [product.images[0].url] : [],
      type: 'website',
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'EUR',
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id)

  const productData = {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
    images: product.images.map((img) => ({ ...img })),
    variants: product.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
      inventory: v.inventory,
    })),
    inventory: product.inventory,
    reviews: product.reviews,
    category: product.category,
    _count: product._count,
    relatedProducts: relatedProducts.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      images: p.images,
      inventory: p.inventory,
    })),
  }

  return <ProductDetailClient product={productData} />
}