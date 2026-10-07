'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, Trash2, ArrowRight, Truck, RotateCcw, Shield, Award } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount, clearCart } = useCart()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  const shipping = subtotal >= 100 ? 0 : 9.99
  const total = subtotal + shipping

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-display-md font-display font-bold">Carrinho de Compras</h1>
        <p className="text-muted-foreground mt-1">{itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho</p>
      </div>

      {items.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <svg className="h-16 w-16 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <h2 className="text-xl font-semibold">Carrinho Vazio</h2>
            <p className="text-muted-foreground max-w-sm">Parece que ainda não adicionou nenhum produto ao seu carrinho.</p>
            <Button asChild size="lg">
              <Link href="/category/all">Continuar a Comprar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={`${item.productId}-${item.variantId || 'default'}`} item={item} />
            ))}

            {/* Promo Code */}
            <Card>
              <CardContent className="pt-6">
                <form className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código promocional"
                    className="flex-1 h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button type="submit" variant="outline">Aplicar</Button>
                </form>
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
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} itens)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envio</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Grátis</span>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>
                  {subtotal < 100 && (
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-xs">
                      Adicione mais <strong>{formatCurrency(100 - subtotal)}</strong> para envio grátis
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Impostos incluídos. Envio calculado no checkout.
                  </p>
                </div>

                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Finalizar Compra
                  </Link>
                </Button>

                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Limpar Carrinho
                </Button>

                {/* Trust Signals */}
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-3 text-xs text-center">
                  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="font-medium">Envio Rápido</span>
                    <span className="text-muted-foreground">24-48h</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
                    <RotateCcw className="h-4 w-4 text-primary" />
                    <span className="font-medium">Devoluções</span>
                    <span className="text-muted-foreground">30 dias</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">Pagamento</span>
                    <span className="text-muted-foreground">Seguro</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="font-medium">Garantia</span>
                    <span className="text-muted-foreground">2 anos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <div className="mt-6 text-center">
              <Button variant="ghost" asChild>
                <Link href="/category/all">← Continuar a Comprar</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CartItem({ item }: { item: any }) {
  const { updateQuantity, removeItem } = useCart()
  const price = item.variant?.price ?? item.product.price
  const image = item.product.images[0]
  const inStock = item.inventory ? item.inventory.quantity - item.inventory.reserved > 0 : true
  const maxQty = item.inventory ? item.inventory.quantity - item.inventory.reserved : 99

  return (
    <Card className="flex flex-col sm:flex-row gap-4 p-4">
      <Link href={`/product/${item.product.slug}`} className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden">
        {image ? (
          <Image src={image.url} alt={item.product.name} fill className="object-cover" sizes="128px" />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
        )}
      </Link>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-primary transition-colors">
            {item.product.name}
          </Link>
          {item.variant && (
            <p className="text-sm text-muted-foreground">{item.variant.name}: {item.variant.value}</p>
          )}
          <p className="text-sm font-semibold mt-1">{formatCurrency(Number(price))}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
              disabled={item.quantity <= 1}
              className="p-1.5 rounded border hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Diminuir"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)), item.variantId)}
              className="w-16 text-center border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              min="1"
              max={maxQty}
            />
            <button
              onClick={() => updateQuantity(item.productId, Math.min(maxQty, item.quantity + 1), item.variantId)}
              disabled={item.quantity >= maxQty}
              className="p-1.5 rounded border hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Aumentar"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-lg">{formatCurrency(Number(price) * item.quantity)}</span>
            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remover"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}