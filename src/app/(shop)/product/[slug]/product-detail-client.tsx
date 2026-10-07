'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, Truck, RotateCcw, Shield, Award, Check, Minus, Plus, Share2, Heart, ShoppingBag } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useCart } from '@/hooks/use-cart'
import type { ProductWithRelations } from '@/types'

interface ProductDetailClientProps {
  product: Omit<ProductWithRelations, 'price' | 'compareAtPrice' | 'costPrice' | 'weight'> & {
    price: number
    compareAtPrice: number | null
    costPrice: number | null
    weight: number | null
    relatedProducts: any[]
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const { addItem, openCart } = useCart()
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [selectedVariant, setSelectedVariant] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState('description')

  const currentPrice = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)?.price ?? product.price
    : product.price

  const currentInventory = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)?.inventory
    : product.inventory

  const inStock = currentInventory ? currentInventory.quantity - currentInventory.reserved > 0 : true
  const stockCount = currentInventory ? currentInventory.quantity - currentInventory.reserved : null

  const handleAddToCart = () => {
    addItem({
      id: `temp-${Date.now()}`,
      userId: '',
      productId: product.id,
      variantId: selectedVariant || null,
      quantity,
      product: product as any,
      variant: selectedVariant ? (product.variants.find((v) => v.id === selectedVariant) || null) : null,
    })
    openCart()
    router.refresh()
  }

  const variantGroups = React.useMemo(() => {
    const groups: Record<string, { name: string; values: string[] }> = {}
    product.variants.forEach((v) => {
      if (!groups[v.name]) groups[v.name] = { name: v.name, values: [] }
      if (!groups[v.name].values.includes(v.value)) groups[v.name].values.push(v.value)
    })
    return Object.values(groups)
  }, [product.variants])

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30" aria-label="Navegação estrutural">
        <div className="container-custom py-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-primary">Início</Link></li>
            <li>/</li>
            <li><Link href={`/category/${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link></li>
            <li>/</li>
            <li className="text-foreground truncate max-w-[200px]" aria-current="page">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Gallery & Info */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt || product.name}
                    fill
                    className="object-cover transition-opacity duration-300"
                    priority
                    sizes="50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                        index === selectedImage ? 'border-primary' : 'border-transparent hover:border-muted'
                      )}
                      aria-label={`Ver imagem ${index + 1}`}
                      aria-current={index === selectedImage ? 'true' : 'false'}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || `Imagem ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.featured && <Badge variant="premium">Em Destaque</Badge>}
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-display-md font-display font-bold">{product.name}</h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground">({product._count?.reviews || 0} avaliações)</span>
                </div>
                <Link href="#reviews" className="text-sm text-primary hover:underline">Ver avaliações</Link>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-display-sm font-display font-bold">{formatCurrency(currentPrice)}</span>
                {product.compareAtPrice && currentPrice < product.compareAtPrice && (
                  <span className="text-lg line-through text-muted-foreground">{formatCurrency(product.compareAtPrice)}</span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDesc && (
                <p className="text-body-md text-muted-foreground border-t pt-4">{product.shortDesc}</p>
              )}

              {/* Variant Selection */}
              {variantGroups.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  {variantGroups.map((group) => (
                    <div key={group.name}>
                      <label className="block text-sm font-medium mb-2">{group.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value) => {
                          const variant = product.variants.find((v) => v.name === group.name && v.value === value)
                          const isSelected = selectedVariant === variant?.id
                          const isOutOfStock = Boolean(variant?.inventory && variant.inventory.quantity - variant.inventory.reserved <= 0)
                          return (
                            <button
                              key={variant?.id}
                              onClick={() => setSelectedVariant(isSelected ? null : variant!.id)}
                              disabled={isOutOfStock}
                              className={cn(
                                'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-input bg-background hover:border-primary',
                                isOutOfStock && 'opacity-50 cursor-not-allowed line-through'
                              )}
                            >
                              {value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 border-t pt-4">
                <label htmlFor="quantity" className="text-sm font-medium">Quantidade</label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-x-0 focus:outline-none focus:ring-0"
                    min="1"
                    max={stockCount || 99}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(stockCount || 99, quantity + 1))}
                    className="p-3 hover:bg-muted transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {stockCount !== null && stockCount < 10 && (
                  <span className="text-sm text-orange-500">Apenas {stockCount} em stock</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t pt-4">
                <Button size="xl" className="flex-1" onClick={handleAddToCart} disabled={!inStock}>
                  {inStock ? (
                    <>
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Adicionar ao Carrinho
                    </>
                  ) : (
                    'Esgotado'
                  )}
                </Button>
                <Button size="xl" variant="outline" className="w-12" aria-label="Adicionar à lista de desejos">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="xl" variant="outline" className="w-12" aria-label="Partilhar produto">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Envio Grátis</p>
                    <p className="text-xs text-muted-foreground">Encomendas &gt; 100€</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Devoluções 30 dias</p>
                    <p className="text-xs text-muted-foreground">Sem complicações</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Pagamento Seguro</p>
                    <p className="text-xs text-muted-foreground">SSL Certificado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Garantia Oficial</p>
                    <p className="text-xs text-muted-foreground">2 anos fabricante</p>
                  </div>
                </div>
              </div>

              {/* Specs Summary */}
              {product.specifications && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Especificações Principais</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(product.specifications as Record<string, string>).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-muted-foreground">{key}</dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="border-y bg-muted/30">
        <div className="container-custom">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-center">
              <TabsTrigger value="description">Descrição</TabsTrigger>
              <TabsTrigger value="specs">Especificações</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações ({product._count?.reviews || 0})</TabsTrigger>
              <TabsTrigger value="shipping">Envio e Devoluções</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8 prose max-w-none">
              <div className="whitespace-pre-wrap">{product.description}</div>
            </TabsContent>

            <TabsContent value="specs" className="mt-8">
              {product.specifications && (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications as Record<string, string>).map(([key, value]) => (
                    <div key={key} className="flex flex-col p-4 rounded-lg bg-card border">
                      <dt className="text-sm text-muted-foreground">{key}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-8" id="reviews">
              <div className="space-y-6">
                {product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <article key={review.id} className="p-6 rounded-lg border bg-card">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {review.user.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{review.user.name || 'Utilizador'}</span>
                            {review.verified && (
                              <span title="Compra verificada">
                                <Check className="h-4 w-4 text-green-500" />
                              </span>
                            )}
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <time className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('pt-PT')}
                            </time>
                          </div>
                          {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                          <p className="text-muted-foreground">{review.content}</p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-12">Sem avaliações ainda. Seja o primeiro a avaliar!</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-8 prose max-w-none">
              <h3>Envio</h3>
              <ul>
                <li>Envio grátis para Portugal Continental em encomendas superiores a 100€</li>
                <li>Envio expresso 24h disponível (custo adicional)</li>
                <li>Envio para ilhas e internacional sob consulta</li>
              </ul>
              <h3>Devoluções</h3>
              <ul>
                <li>30 dias para devolução gratuita</li>
                <li>Produto deve estar em estado original com embalagem</li>
                <li>Reembolso no método de pagamento original</li>
              </ul>
              <h3>Garantia</h3>
              <p>Todos os produtos têm garantia oficial de fabricante de 2 anos.</p>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts.length > 0 && (
        <section className="section" aria-label="Produtos Relacionados">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-display-sm font-display font-bold">Também Pode Gostar</h2>
              <Button variant="ghost" asChild>
                <Link href={`/category/${product.category.slug}`}>Ver Todos <ChevronRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((related) => (
                <RelatedProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function RelatedProductCard({ product }: { product: any }) {
  const discount = product.compareAtPrice 
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null

  return (
    <article className="group relative bg-card rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          )}
          {discount && <Badge variant="destructive" className="absolute top-2 right-2">-{discount}%</Badge>}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-semibold">{formatCurrency(Number(product.price))}</span>
            {product.compareAtPrice && (
              <span className="text-sm line-through text-muted-foreground">{formatCurrency(Number(product.compareAtPrice))}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}