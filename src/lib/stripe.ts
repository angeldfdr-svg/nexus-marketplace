import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function createPaymentIntent(
  amount: number,
  currency = 'eur',
  metadata: Record<string, string> = {}
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects cents
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  })
}

export async function createCheckoutSession(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  metadata: Record<string, string> = {}
) {
  return stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata,
    shipping_address_collection: {
      allowed_countries: ['PT', 'ES', 'FR', 'DE', 'IT'],
    },
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
  })
}

export async function createCustomer(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name,
  })
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}