import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: { include: { images: { take: 1 } } },
              variant: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
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
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Erro ao buscar encomendas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      items,
      shippingMethod,
      paymentMethod,
      shippingAddress,
      billingAddress,
      email,
      notes,
    } = body

    // Validate items and calculate totals
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { inventory: true, variants: { include: { inventory: true } } },
    })

    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json({ error: `Produto ${item.productId} não encontrado` }, { status: 400 })
      }

      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : null

      const price = variant?.price ?? product.price
      const inventory = variant?.inventory ?? product.inventory
      const availableStock = inventory ? inventory.quantity - inventory.reserved : 999

      if (availableStock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 })
      }

      const itemTotal = Number(price) * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: product.id,
        variantId: item.variantId,
        name: product.name,
        sku: variant?.sku || product.sku,
        price: Number(price),
        quantity: item.quantity,
        total: itemTotal,
      })
    }

    const shippingCost = shippingMethod === 'express' ? 9.99 : 0
    const taxRate = 0.23 // 23% IVA Portugal
    const taxAmount = subtotal * taxRate
    const total = subtotal + shippingCost + taxAmount

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal,
        taxAmount,
        shippingAmount: shippingCost,
        total,
        currency: 'EUR',
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        shippingMethod,
        notes,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: true, variant: true } },
      },
    })

    // Reserve inventory
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!
      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : null

      if (variant?.inventory) {
        await prisma.inventory.update({
          where: { id: variant.inventory.id },
          data: { reserved: { increment: item.quantity } },
        })
      } else if (product.inventory) {
        await prisma.inventory.update({
          where: { id: product.inventory.id },
          data: { reserved: { increment: item.quantity } },
        })
      }
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        currency: 'EUR',
        status: 'PENDING',
        provider: paymentMethod,
        metadata: { email },
      },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      clientSecret: paymentMethod === 'card' ? 'pi_mock_client_secret' : undefined,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Erro ao criar encomenda' }, { status: 500 })
  }
}