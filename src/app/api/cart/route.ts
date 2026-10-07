import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ items: [], subtotal: 0, itemCount: 0 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { position: 'asc' }, take: 1 },
            inventory: true,
            variants: { include: { inventory: true } },
          },
        },
        variant: { include: { inventory: true } },
      },
    })

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant?.price ?? item.product.price
      return sum + Number(price) * item.quantity
    }, 0)

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({ items: cartItems, subtotal, itemCount })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Erro ao buscar carrinho' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true, variants: { include: { inventory: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const inventory = variantId
      ? product.variants.find((v) => v.id === variantId)?.inventory
      : product.inventory

    const availableStock = inventory ? inventory.quantity - inventory.reserved : 999
    if (availableStock < quantity) {
      return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 })
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId: variantId || null,
        },
      },
    })

    let cartItem
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: { include: { images: { take: 1 }, inventory: true } },
          variant: { include: { inventory: true } },
        },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId,
          quantity,
        },
        include: {
          product: { include: { images: { take: 1 }, inventory: true } },
          variant: { include: { inventory: true } },
        },
      })
    }

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Erro ao adicionar ao carrinho' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const variantId = searchParams.get('variantId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID obrigatório' }, { status: 400 })
    }

    await prisma.cartItem.delete({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId: variantId || null,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Erro ao remover do carrinho' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, variantId, quantity } = body

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantidade inválida' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true, variants: { include: { inventory: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const inventory = variantId
      ? product.variants.find((v) => v.id === variantId)?.inventory
      : product.inventory

    const availableStock = inventory ? inventory.quantity - inventory.reserved : 999
    if (availableStock < quantity) {
      return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId: variantId || null,
        },
      },
      data: { quantity },
      include: {
        product: { include: { images: { take: 1 }, inventory: true } },
        variant: { include: { inventory: true } },
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Erro ao atualizar carrinho' }, { status: 500 })
  }
}