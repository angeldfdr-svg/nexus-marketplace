'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount, closeCart, isOpen, openCart } = useCart()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  const shipping = subtotal >= 100 ? 0 : 9.99
  const total = subtotal + shipping

  if (!isOpen) return null

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:max-w-md lg:max-w-lg p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Carrinho ({itemCount})</SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Carrinho vazio</h3>
              <p className="text-muted-foreground mb-6">Adicione produtos para começar</p>
              <Button asChild onClick={closeCart}>
                <Link href="/category/all">Continuar a Comprar</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={`${item.productId}-${item.variantId || 'default'}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />
            <SheetFooter className="p-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envio</span>
                  <span>{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</span>
                </div>
                {subtotal < 100 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Adicione mais {formatCurrency(100 - subtotal)} para envio grátis
                  </p>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Finalizar Compra
                </Link>
              </Button>

              <Button variant="outline" className="w-full" onClick={closeCart}>
                Continuar a Comprar
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CartItem({ item }: { item: any }) {
  const { updateQuantity, removeItem } = useCart()
  const price = item.variant?.price ?? item.product.price
  const image = item.product.images[0]
  const inStock = item.inventory ? item.inventory.quantity - item.inventory.reserved > 0 : true

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
      <Link href={`/product/${item.product.slug}`} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
        {image ? (
          <Image src={image.url} alt={item.product.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.product.slug}`} className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
          {item.product.name}
        </Link>
        {item.variant && (
          <p className="text-xs text-muted-foreground">{item.variant.name}: {item.variant.value}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-sm">{formatCurrency(Number(price) * item.quantity)}</span>
          <span className="text-muted-foreground text-xs">{formatCurrency(Number(price))} cada</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
            disabled={item.quantity <= 1}
            className="p-1 rounded hover:bg-background transition-colors disabled:opacity-50"
            aria-label="Diminuir quantidade"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
            disabled={!inStock}
            className="p-1 rounded hover:bg-background transition-colors disabled:opacity-50"
            aria-label="Aumentar quantidade"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <button
        onClick={() => removeItem(item.productId, item.variantId)}
        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Remover item"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}