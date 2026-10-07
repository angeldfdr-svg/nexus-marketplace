'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Filter, X, Grid, List, SlidersHorizontal, Loader2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Category } from '@prisma/client'

interface CategoryPageClientProps {
  category: Category & {
    children?: any[]
    parent?: { id: string; name: string; slug: string } | null
    products: any[]
    subcategories: any[]
    filters: { priceRange: { min: number; max: number }; tags: string[] }
    pagination: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean }
    currentFilters: any
  }
}

export function CategoryPageClient({ category }: CategoryPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    category.filters.priceRange.min,
    category.filters.priceRange.max,
  ])
  const [selectedTags, setSelectedTags] = React.useState<string[]>(category.currentFilters.tags || [])
  const [inStockOnly, setInStockOnly] = React.useState(category.currentFilters.inStock)
  const [featuredOnly, setFeaturedOnly] = React.useState(category.currentFilters.featured)

  const createQueryString = (params: Record<string, any>) => {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        sp.delete(key)
      } else if (Array.isArray(value)) {
        sp.delete(key)
        value.forEach((v) => sp.append(key, v))
      } else {
        sp.set(key, String(value))
      }
    })
    return sp.toString()
  }

  const handleFilterChange = (key: string, value: any) => {
    router.push(`/category/${category.slug}?${createQueryString({ [key]: value, page: 1 })}`)
  }

  const handleMultipleFilterChange = (filters: Record<string, any>) => {
    router.push(`/category/${category.slug}?${createQueryString({ ...filters, page: 1 })}`)
  }

  const clearFilters = () => {
    router.push(`/category/${category.slug}`)
  }

  const hasActiveFilters = 
    priceRange[0] > category.filters.priceRange.min ||
    priceRange[1] < category.filters.priceRange.max ||
    selectedTags.length > 0 ||
    inStockOnly ||
    featuredOnly

  return (
    <div className="flex flex-col">
      {/* Category Header */}
      <header className="border-b bg-muted/30">
        <div className="container-custom py-12 lg:py-16">
          <div className="max-w-3xl">
            {category.parent && (
              <Link
                href={`/category/${category.parent.slug}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
              >
                <ChevronLeft className="h-4 w-4" />
                {category.parent.name}
              </Link>
            )}
            <h1 className="text-display-lg font-display font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-body-lg text-muted-foreground">{category.description}</p>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              {category.pagination.total} {category.pagination.total === 1 ? 'produto' : 'produtos'} encontrados
            </div>
          </div>
        </div>
      </header>

      {/* Subcategories */}
      {category.subcategories.length > 0 && (
        <div className="border-b bg-muted/30 py-6">
          <div className="container-custom">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full bg-background border text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors whitespace-nowrap"
                >
                  {sub.name} <span className="ml-2 text-muted-foreground">({sub._count.products})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid/List */}
      <div className="flex-1">
        <div className="container-custom py-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select value={category.currentFilters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                  <SelectItem value="price_asc">Preço: Menor para Maior</SelectItem>
                  <SelectItem value="price_desc">Preço: Maior para Menor</SelectItem>
                  <SelectItem value="popular">Mais Populares</SelectItem>
                  <SelectItem value="rating">Melhor Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Vista em grelha"
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="Vista em lista"
              >
                <List className="h-5 w-5" />
              </Button>

              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtros</span>
                    {hasActiveFilters && (
                      <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                        {[
                          priceRange[0] > category.filters.priceRange.min || priceRange[1] < category.filters.priceRange.max ? 1 : 0,
                          ...selectedTags.map(() => 1),
                          inStockOnly ? 1 : 0,
                          featuredOnly ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Price Range */}
                    <div>
                      <Label className="block mb-2">Preço</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
                          min={category.filters.priceRange.min}
                          max={priceRange[1]}
                        />
                        <span className="text-muted-foreground">–</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
                          min={priceRange[0]}
                          max={category.filters.priceRange.max}
                        />
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => handleMultipleFilterChange({ minPrice: priceRange[0], maxPrice: priceRange[1] })}>
                        Aplicar
                      </Button>
                    </div>

                    <Separator />

                    {/* Tags */}
                    {category.filters.tags.length > 0 && (
                      <div>
                        <Label className="block mb-2">Características</Label>
                        <div className="flex flex-wrap gap-2">
                          {category.filters.tags.slice(0, 10).map((tag) => (
                            <label key={tag} className="inline-flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={selectedTags.includes(tag)}
                                onCheckedChange={(checked) => {
                                  setSelectedTags(checked === true 
                                    ? [...selectedTags, tag] 
                                    : selectedTags.filter((t) => t !== tag)
                                  )
                                }}
                              />
                              <span className="text-sm">{tag}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Options */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={inStockOnly} onCheckedChange={(checked) => setInStockOnly(checked === true)} />
                        <span className="text-sm">Apenas em stock</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={featuredOnly} onCheckedChange={(checked) => setFeaturedOnly(checked === true)} />
                        <span className="text-sm">Apenas em destaque</span>
                      </label>
                    </div>

                    {hasActiveFilters && (
                      <Button variant="outline" className="w-full" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Products */}
          {category.products.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {category.products.map((product) => (
                    <ProductCardList key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {category.pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={!category.pagination.hasPrev}
                    onClick={() => handleFilterChange('page', category.pagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, category.pagination.totalPages) }, (_, i) => {
                      let pageNum: number
                      if (category.pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (category.pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (category.pagination.page >= category.pagination.totalPages - 2) {
                        pageNum = category.pagination.totalPages - 4 + i
                      } else {
                        pageNum = category.pagination.page - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === category.pagination.page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFilterChange('page', pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    disabled={!category.pagination.hasNext}
                    onClick={() => handleFilterChange('page', category.pagination.page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-6">Tente ajustar os filtros ou pesquisar noutra categoria.</p>
              <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  const discount = product.compareAtPrice 
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null

  const inStock = product.inventory ? product.inventory.quantity - product.inventory.reserved > 0 : true

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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          )}
          {product.featured && <Badge variant="premium" className="absolute top-2 left-2">Destaque</Badge>}
          {discount && <Badge variant="destructive" className="absolute top-2 right-2">-{discount}%</Badge>}
          {!inStock && <Badge variant="outline" className="absolute bottom-2 left-2 right-2 bg-destructive/10 text-destructive border-destructive">Esgotado</Badge>}
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

function ProductCardList({ product }: { product: any }) {
  const discount = product.compareAtPrice 
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null

  const inStock = product.inventory ? product.inventory.quantity - product.inventory.reserved > 0 : true

  return (
    <article className="group flex gap-4 bg-card rounded-xl border p-4 transition-all duration-300 hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {product.images[0] ? (
          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="128px" />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
        )}
        {discount && <Badge variant="destructive" className="absolute top-2 right-2">-{discount}%</Badge>}
      </Link>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-semibold">{formatCurrency(Number(product.price))}</span>
            {product.compareAtPrice && (
              <span className="text-sm line-through text-muted-foreground">{formatCurrency(Number(product.compareAtPrice))}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button size="sm" className="flex-1" disabled={!inStock}>
            {inStock ? 'Adicionar' : 'Esgotado'}
          </Button>
        </div>
      </div>
    </article>
  )
}