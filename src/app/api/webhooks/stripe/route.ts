import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { constructWebhookEvent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const event = constructWebhookEvent(body, signature)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const orderId = session.metadata?.orderId
        const paymentId = session.metadata?.paymentId

        if (orderId && paymentId) {
          await prisma.$transaction([
            prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'CONFIRMED',
                paymentStatus: 'SUCCEEDED',
                confirmedAt: new Date(),
              },
            }),
            prisma.payment.update({
              where: { id: paymentId },
              data: {
                status: 'SUCCEEDED',
                providerId: session.payment_intent as string,
                processedAt: new Date(),
              },
            }),
          ])

          // Convert reserved to sold
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          })

          if (order) {
            for (const item of order.items) {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
                include: { inventory: true, variants: { include: { inventory: true } } },
              })

              if (product) {
                const variant = item.variantId
                  ? product.variants.find((v) => v.id === item.variantId)
                  : null

                if (variant?.inventory) {
                  await prisma.inventory.update({
                    where: { id: variant.inventory.id },
                    data: {
                      quantity: { decrement: item.quantity },
                      reserved: { decrement: item.quantity },
                    },
                  })
                } else if (product.inventory) {
                  await prisma.inventory.update({
                    where: { id: product.inventory.id },
                    data: {
                      quantity: { decrement: item.quantity },
                      reserved: { decrement: item.quantity },
                    },
                  })
                }
              }
            }
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const payment = await prisma.payment.findFirst({
          where: { providerId: paymentIntent.id },
        })

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          })

          await prisma.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
          })

          // Release reserved inventory
          const order = await prisma.order.findUnique({
            where: { id: payment.orderId },
            include: { items: true },
          })

          if (order) {
            for (const item of order.items) {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
                include: { inventory: true, variants: { include: { inventory: true } } },
              })

              if (product) {
                const variant = item.variantId
                  ? product.variants.find((v) => v.id === item.variantId)
                  : null

                if (variant?.inventory) {
                  await prisma.inventory.update({
                    where: { id: variant.inventory.id },
                    data: { reserved: { decrement: item.quantity } },
                  })
                } else if (product.inventory) {
                  await prisma.inventory.update({
                    where: { id: product.inventory.id },
                    data: { reserved: { decrement: item.quantity } },
                  })
                }
              }
            }
          }
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        const payment = await prisma.payment.findFirst({
          where: { providerId: charge.payment_intent as string },
        })

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUNDED' },
          })

          await prisma.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}