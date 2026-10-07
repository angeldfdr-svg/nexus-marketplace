import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import prisma from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

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
    const lineItems: any[] = []

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

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            description: variant ? `${variant.name}: ${variant.value}` : undefined,
            images: product.images[0] ? [product.images[0].url] : [],
            metadata: { productId: product.id, variantId: item.variantId || '' },
          },
          unit_amount: Math.round(Number(price) * 100),
        },
        quantity: item.quantity,
      })
    }

    const shippingCost = shippingMethod === 'express' ? 9.99 : 0
    const taxRate = 0.23
    const taxAmount = subtotal * taxRate
    const total = subtotal + shippingCost + taxAmount

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Envio Expresso' },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      })
    }

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
      include: { items: { include: { product: true, variant: true } } },
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
    const payment = await prisma.payment.create({
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

    // Handle Stripe payment
    if (paymentMethod === 'card') {
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order_id=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
        customer_email: email,
        metadata: {
          orderId: order.id,
          paymentId: payment.id,
        },
        shipping_address_collection: {
          allowed_countries: ['PT', 'ES', 'FR', 'DE', 'IT'],
        },
      })

      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerId: stripeSession.id },
      })

      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutUrl: stripeSession.url,
      })
    }

    // For other payment methods, return order info
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      paymentInstructions: paymentMethod === 'multibanco' 
        ? 'Receberá a referência Multibanco por email' 
        : 'Aguardando pagamento via MB WAY',
    })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json({ error: 'Erro ao processar checkout' }, { status: 500 })
  }
}