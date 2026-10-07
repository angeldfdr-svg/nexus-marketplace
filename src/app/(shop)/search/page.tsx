'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = React.useState(searchParams.get('q') || '')
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  const suggestions = [
    'drones', 'headphones', 'smart home', 'camera', 'smartwatch',
    'laptop', 'monitor', 'speaker', 'earbuds', 'tablet'
  ]

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults(data.products || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSearch(q)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      handleSearch(query)
      setShowSuggestions(false)
    }
  }

  return (
    <div className="container-custom py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-display-md font-display font-bold mb-4">
          {query ? `Resultados para "${query}"` : 'Pesquisar Produtos'}
        </h1>
        {query && (
          <p className="text-muted-foreground">
            {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        )}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Pesquisar produtos, categorias, marcas..."
            className="w-full h-14 pl-12 pr-12 rounded-xl border border-input bg-background text-lg focus:outline-none focus:ring-2 focus:ring-ring"
            autoComplete="off"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setQuery('')}
              aria-label="Limpar pesquisa"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <Button type="submit" className="absolute right-10 top-1/2 -translate-y-1/2" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </Button>
        </div>

        {/* Suggestions */}
        {showSuggestions && query.length < 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg p-3 z-50">
            <p className="text-xs text-muted-foreground mb-2">Sugestões populares</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s)
                    handleSearch(s)
                    router.push(`/search?q=${encodeURIComponent(s)}`)
                  }}
                  className="px-3 py-1.5 text-sm rounded-full border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Results */}
      {query && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="aspect-square rounded-lg bg-muted mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-16">
              <CardContent>
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Não encontramos produtos para "<strong>{query}</strong>"
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(s)}`)
                      }}
                      className="px-3 py-1.5 text-sm rounded-full border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!query && !loading && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
          <h2 className="text-xl font-semibold mb-2">Pesquise o nosso catálogo</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Encontre drones, áudio, smart home, fotografia, wearables e muito mais.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s)
                  handleSearch(s)
                  router.push(`/search?q=${encodeURIComponent(s)}`)
                }}
                className="px-4 py-2 rounded-lg border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-custom py-16 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" /><p className="text-muted-foreground">A carregar...</p></div>}>
      <SearchPageContent />
    </Suspense>
  )
}

function ProductCard({ product }: { product: any }) {
  const discount = product.compareAtPrice 
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null

  return (
    <Card className="group overflow-hidden h-full transition-all hover:shadow-xl hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 002 2z"/></svg>
            </div>
          )}
          {product.featured && <Badge variant="premium" className="absolute top-2 left-2">Destaque</Badge>}
          {discount && <Badge variant="destructive" className="absolute top-2 right-2">-{discount}%</Badge>}
        </div>
        <CardContent className="p-4 pt-4">
          <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-semibold">{formatCurrency(Number(product.price))}</span>
            {product.compareAtPrice && (
              <span className="text-sm line-through text-muted-foreground">{formatCurrency(Number(product.compareAtPrice))}</span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}