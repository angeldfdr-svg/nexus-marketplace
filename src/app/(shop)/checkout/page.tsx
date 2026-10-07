'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Truck, Shield, RotateCcw, Award, CreditCard, Banknote, Smartphone, Loader2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js'
import { PaymentElement } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard', price: 0, description: '3-5 dias úteis', freeThreshold: 100 },
  { id: 'express', name: 'Expresso', price: 9.99, description: '24-48h' },
  { id: 'pickup', name: 'Levantamento em Loja', price: 0, description: 'Disponível em 2h' },
]

const PAYMENT_METHODS = [
  { id: 'card', name: 'Cartão de Crédito/Débito', icon: CreditCard },
  { id: 'mbway', name: 'MB WAY', icon: Smartphone },
  { id: 'multibanco', name: 'Multibanco', icon: Banknote },
]

function CheckoutForm() {
  const router = useRouter()
  const { items, getSubtotal, getItemCount, clearCart } = useCart()
  const stripe = useStripe()
  const elements = useElements()
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  const [shippingMethod, setShippingMethod] = React.useState('standard')
  const [paymentMethod, setPaymentMethod] = React.useState('card')
  const [formData, setFormData] = React.useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'PT',
    phone: '',
    sameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
    billingCompany: '',
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'PT',
    notes: '',
    terms: false,
    newsletter: false,
  })

  const shippingCost = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price || 0
  const total = subtotal + shippingCost

  const validateStep = (stepNum: number) => {
    const newErrors: Record<string, string> = {}
    
    if (stepNum <= 1) {
      if (!formData.email || !formData.email.includes('@')) newErrors.email = 'Email inválido'
      if (!formData.firstName.trim()) newErrors.firstName = 'Nome obrigatório'
      if (!formData.lastName.trim()) newErrors.lastName = 'Apelido obrigatório'
      if (!formData.address1.trim()) newErrors.address1 = 'Morada obrigatória'
      if (!formData.city.trim()) newErrors.city = 'Cidade obrigatória'
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Código postal obrigatório'
      if (!formData.phone.trim()) newErrors.phone = 'Telefone obrigatório'
    }
    
    if (stepNum <= 2 && !formData.terms) {
      newErrors.terms = 'Deve aceitar os termos e condições'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return
    if (step < 3) return setStep(step + 1)

    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingMethod,
          paymentMethod,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            company: formData.company,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
          },
          billingAddress: formData.sameAsShipping ? null : {
            firstName: formData.billingFirstName,
            lastName: formData.billingLastName,
            company: formData.billingCompany,
            address1: formData.billingAddress1,
            address2: formData.billingAddress2,
            city: formData.billingCity,
            state: formData.billingState,
            postalCode: formData.billingPostalCode,
            country: formData.billingCountry,
          },
          email: formData.email,
          notes: formData.notes,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar encomenda')
      }

      if (data.clientSecret && paymentMethod === 'card') {
        if (!stripe || !elements) {
          throw new Error('Sistema de pagamento não está pronto. Por favor tente novamente.')
        }
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?order_id=${data.orderId}`,
          },
        })
        if (error) throw error
      } else {
        router.push(`/checkout/success?order_id=${data.orderId}`)
      }
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const shippingMethodData = SHIPPING_METHODS.find((m) => m.id === shippingMethod)!

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Steps */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              'flex items-center gap-2',
              step >= s ? 'text-primary' : 'text-muted-foreground'
            )}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2',
                step > s ? 'bg-primary border-primary text-primary-foreground' :
                step === s ? 'border-primary bg-background' : 'border-muted'
              )}>
                {step > s ? <span className="h-4 w-4" /> : s}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {['Informação', 'Entrega', 'Pagamento'][s - 1]}
              </span>
            </div>
            {s < 3 && (
              <div className={cn(
                'flex-1 h-0.5 mx-4',
                step > s ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Contact & Shipping Info */}
      {step === 1 && (
        <div className="space-y-6" data-step="1">
          <h2 className="text-xl font-semibold">Informação de Contacto e Entrega</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                placeholder="+351 9xx xxx xxx"
                autoComplete="tel"
              />
            </div>
          </div>

          <Separator className="my-4" />
          <h3 className="font-medium">Morada de Entrega</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={errors.firstName}
                placeholder="João"
                autoComplete="given-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apelido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={errors.lastName}
                placeholder="Silva"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Opcional"
              autoComplete="organization"
            />
          </div>

          <div>
            <Label htmlFor="address1">Morada *</Label>
            <Input
              id="address1"
              value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
              error={errors.address1}
              placeholder="Rua Exemplo, 123"
              autoComplete="street-address"
            />
          </div>

          <div>
            <Label htmlFor="address2">Complemento</Label>
            <Input
              id="address2"
              value={formData.address2}
              onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
              placeholder="Apartamento, andar, etc."
              autoComplete="address-line2"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                error={errors.city}
                placeholder="Lisboa"
                autoComplete="address-level2"
              />
            </div>
            <div>
              <Label htmlFor="state">Distrito *</Label>
              <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu', 'Açores', 'Madeira'].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode">Código Postal *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                error={errors.postalCode}
                placeholder="1000-001"
                autoComplete="postal-code"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">País</Label>
            <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PT">Portugal</SelectItem>
                <SelectItem value="ES">Espanha</SelectItem>
                <SelectItem value="FR">França</SelectItem>
                <SelectItem value="DE">Alemanha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={() => validateStep(1) && setStep(2)}>
            Continuar para Entrega <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Shipping Method */}
      {step === 2 && (
        <div className="space-y-6" data-step="2">
          <h2 className="text-xl font-semibold">Método de Entrega</h2>
          
          <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
            <div className="space-y-3">
              {SHIPPING_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    'relative flex items-center p-4 rounded-lg border cursor-pointer transition-all',
                    shippingMethod === method.id ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value={method.id} className="sr-only" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{method.name}</span>
                      <span className="font-semibold">
                        {method.price === 0 ? 'Grátis' : formatCurrency(method.price)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    shippingMethod === method.id ? 'border-primary bg-primary' : 'border-muted'
                  )}>
                    {shippingMethod === method.id && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>

          {subtotal < 100 && shippingMethod === 'standard' && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                Adicione mais <strong>{formatCurrency(100 - subtotal)}</strong> para envio standard grátis!
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
            <Button onClick={() => validateStep(2) && setStep(3)}>Continuar para Pagamento <ArrowRight className="h-5 w-5 ml-2" /></Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="space-y-6" data-step="3">
          <h2 className="text-xl font-semibold">Pagamento</h2>

          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    'relative flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                    paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value={method.id} className="sr-only" />
                  <method.icon className={cn('h-6 w-6', paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="font-medium">{method.name}</span>
                </label>
              ))}
            </div>
          </RadioGroup>

          {paymentMethod === 'card' && (
            <div className="p-4 rounded-lg border bg-background">
              <PaymentElement
                options={{
                  layout: 'tabs',
                }}
              />
            </div>
          )}

          {paymentMethod === 'mbway' && (
            <div className="p-4 rounded-lg border bg-background">
              <Input
                placeholder="Número de telemóvel MB WAY"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Receberá uma notificação na app MB WAY para autorizar o pagamento.
              </p>
            </div>
          )}

          {paymentMethod === 'multibanco' && (
            <div className="p-4 rounded-lg border bg-background bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-800">
                Após confirmar a encomenda, receberá a entidade, referência e valor para pagamento
                numa caixa Multibanco ou no seu homebanking. A encomenda será processada após confirmação do pagamento.
              </p>
            </div>
          )}

          {/* Billing Address */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.sameAsShipping}
                onCheckedChange={(checked) => setFormData({ ...formData, sameAsShipping: checked === true })}
              />
              <span>Usar a mesma morada para faturação</span>
            </label>

            {!formData.sameAsShipping && (
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                <h4 className="font-medium col-span-full">Morada de Faturação</h4>
                <div>
                  <Label htmlFor="billingFirstName">Nome</Label>
                  <Input
                    id="billingFirstName"
                    value={formData.billingFirstName}
                    onChange={(e) => setFormData({ ...formData, billingFirstName: e.target.value })}
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <Label htmlFor="billingLastName">Apelido</Label>
                  <Input
                    id="billingLastName"
                    value={formData.billingLastName}
                    onChange={(e) => setFormData({ ...formData, billingLastName: e.target.value })}
                    placeholder="Apelido"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="billingAddress1">Morada</Label>
                  <Input
                    id="billingAddress1"
                    value={formData.billingAddress1}
                    onChange={(e) => setFormData({ ...formData, billingAddress1: e.target.value })}
                    placeholder="Rua Exemplo, 123"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="billingAddress2">Complemento</Label>
                  <Input
                    id="billingAddress2"
                    value={formData.billingAddress2}
                    onChange={(e) => setFormData({ ...formData, billingAddress2: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <Label htmlFor="billingCity">Cidade</Label>
                  <Input
                    id="billingCity"
                    value={formData.billingCity}
                    onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="billingPostalCode">Código Postal</Label>
                  <Input
                    id="billingPostalCode"
                    value={formData.billingPostalCode}
                    onChange={(e) => setFormData({ ...formData, billingPostalCode: e.target.value })}
                    placeholder="1000-001"
                  />
                </div>
                <div>
                  <Label htmlFor="billingCountry">País</Label>
                  <Select value={formData.billingCountry} onValueChange={(v) => setFormData({ ...formData, billingCountry: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PT">Portugal</SelectItem>
                      <SelectItem value="ES">Espanha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Terms & Submit */}
          <div className="space-y-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked === true })}
                error={!!errors.terms}
              />
              <span className="text-sm text-muted-foreground">
                Aceito os <Link href="/terms" className="text-primary hover:underline">Termos e Condições</Link> e a 
                <Link href="/privacy" className="text-primary hover:underline">Política de Privacidade</Link> *
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.newsletter}
                onCheckedChange={(checked) => setFormData({ ...formData, newsletter: checked === true })}
              />
              <span className="text-sm text-muted-foreground">Subscrever newsletter</span>
            </label>

            {errors.submit && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <>Confirmar Encomenda <ArrowRight className="h-5 w-5 ml-2" /></>}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Pagamento seguro processado por Stripe. Os seus dados estão protegidos.
            </p>
          </div>
        </div>
      )}
    </form>
  )
}

export default function CheckoutPage() {
  const { items, getSubtotal, getItemCount } = useCart()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-display-md font-display font-bold mb-4">Carrinho Vazio</h1>
        <p className="text-muted-foreground mb-8">Adicione produtos ao carrinho antes de finalizar a compra.</p>
        <Button asChild size="lg">
          <Link href="/category/all">Continuar a Comprar</Link>
        </Button>
      </div>
    )
  }

  const shippingCost = SHIPPING_METHODS.find((m) => m.id === 'standard')?.price || 0
  const total = subtotal + shippingCost

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-display-md font-display font-bold">Finalizar Compra</h1>
        <p className="text-muted-foreground mt-1">{itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo da Encomenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      {item.variant && <p className="text-xs text-muted-foreground">{item.variant.value}</p>}
                      <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(Number(item.variant?.price ?? item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envio (Standard)</span>
                  <span>{shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-center pt-2 border-t">
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="font-medium">Envio Rápido</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <span className="font-medium">Devoluções 30 dias</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">Pagamento Seguro</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="font-medium">Garantia 2 anos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
