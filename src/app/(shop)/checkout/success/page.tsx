'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Truck, Mail, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Suspense } from 'react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [loading, setLoading] = React.useState(true)
  const [order, setOrder] = React.useState<any>(null)

  React.useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">A verificar a sua encomenda...</p>
      </div>
    )
  }

  return (
    <div className="container-custom py-16">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-display-md font-display font-bold mb-4">Encomenda Confirmada!</h1>
        <p className="text-body-lg text-muted-foreground">
          Obrigado pela sua compra. A sua encomenda foi processada com sucesso.
        </p>
        {orderId && (
          <p className="text-sm text-muted-foreground mt-4">
            Número da encomenda: <strong className="text-foreground font-mono">{orderId}</strong>
          </p>
        )}
      </div>

      {order && (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Truck className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Envio</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {order.shippingMethod === 'express' ? 'Expresso 24-48h' : 
                   order.shippingMethod === 'pickup' ? 'Levantamento em loja' : 'Standard 3-5 dias'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Mail className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Confirmação</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Enviada para {order.email}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">#{order.id.slice(-6).toUpperCase()}</span>
                </div>
                <h3 className="font-semibold">Acompanhar</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Ver estado na sua conta
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/account/orders">Ver Minhas Encomendas <ArrowRight className="h-5 w-5 ml-2" /></Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/category/all">Continuar a Comprar</Link>
        </Button>
      </div>

      <div className="mt-12 p-6 rounded-xl bg-muted/30 text-left">
        <h3 className="font-semibold mb-4">O que acontece agora?</h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span> Receberá um email de confirmação com os detalhes da encomenda</li>
          <li className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span> A sua encomenda será preparada e enviada dentro de 24h</li>
          <li className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">3</span> Receberá o código de rastreio por email assim que expedida</li>
          <li className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">4</span> Pode acompanhar o estado na sua área de cliente</li>
        </ol>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-custom py-16 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" /><p className="text-muted-foreground">A carregar...</p></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}