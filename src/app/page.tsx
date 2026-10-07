import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Truck, Shield, RotateCcw, Award, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Premium Technology Marketplace',
  description: 'Descubra tecnologia premium curada. Drones, áudio, smart home, fotografia e muito mais. Envio grátis > 100€, devoluções 30 dias, garantia oficial.',
}

const HERO_STATS = [
  { value: '500+', label: 'Produtos Curados' },
  { value: '50+', label: 'Marcas Premium' },
  { value: '98%', label: 'Satisfação' },
  { value: '24h', label: 'Envio Expresso' },
]

const FEATURES = [
  { icon: Truck, title: 'Envio Grátis', description: 'Em encomendas superiores a 100€ para Portugal Continental' },
  { icon: RotateCcw, title: 'Devoluções 30 Dias', description: 'Processo simples e sem complicações' },
  { icon: Shield, title: 'Pagamento Seguro', description: 'Certificado SSL e parceiros de confiança' },
  { icon: Award, title: 'Garantia Oficial', description: 'Todos os produtos com garantia de fabricante' },
]

const CATEGORIES = [
  { name: 'Drones & Robótica', slug: 'drones-robotics', image: '/images/cat-drones.jpg', count: 42, featured: true },
  { name: 'Áudio Premium', slug: 'audio', image: '/images/cat-audio.jpg', count: 68 },
  { name: 'Smart Home Pro', slug: 'smart-home', image: '/images/cat-smart-home.jpg', count: 54 },
  { name: 'Fotografia & Vídeo', slug: 'photo-video', image: '/images/cat-photo.jpg', count: 89 },
  { name: 'Wearables & Saúde', slug: 'wearables', image: '/images/cat-wearables.jpg', count: 31 },
  { name: 'Computing & Acessórios', slug: 'computing', image: '/images/cat-computing.jpg', count: 76 },
]

const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'NEXUS One Drone Pro',
    slug: 'nexus-one-drone-pro',
    price: 2499,
    compareAtPrice: 2799,
    image: '/images/product-drone-pro.jpg',
    badge: 'Lançamento',
    rating: 4.9,
    reviews: 127,
  },
  {
    id: '2',
    name: 'Auric X1 Headphones',
    slug: 'auric-x1-headphones',
    price: 899,
    image: '/images/product-headphones.jpg',
    badge: 'Best Seller',
    rating: 4.8,
    reviews: 203,
  },
  {
    id: '3',
    name: 'Lumina Smart Light Kit',
    slug: 'lumina-smart-light-kit',
    price: 349,
    compareAtPrice: 399,
    image: '/images/product-smart-light.jpg',
    badge: 'Oferta',
    rating: 4.7,
    reviews: 89,
  },
  {
    id: '4',
    name: 'Optic R5 Mirrorless',
    slug: 'optic-r5-mirrorless',
    price: 3899,
    image: '/images/product-camera.jpg',
    badge: 'Profissional',
    rating: 4.9,
    reviews: 56,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/50">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" aria-hidden="true" />
        
        <div className="container-custom relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="premium" className="mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3 mr-1" /> Nova Coleção NEXUS One Disponível
            </Badge>
            
            <h1 className="text-display-xl font-display font-bold tracking-tight text-foreground mb-6 animate-slide-up stagger-1">
              Tecnologia que{' '}
              <span className="gradient-text">eleva</span>{' '}
              a sua experiência
            </h1>
            
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up stagger-2">
              Curamos a melhor tecnologia premium mundial. Drones profissionais, áudio high-end, 
              smart home inteligente e fotografia de nível cinematográfico.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
              <Button size="xl" asChild>
                <Link href="/category/nexus-one">Explorar Coleção <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/category/all">Ver Todos os Produtos</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in stagger-4">
              {HERO_STATS.map((stat, i) => (
                <div key={stat.label} className="stagger-{i+5}">
                  <div className="text-display-md font-display font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y bg-muted/30 py-6" aria-label="Benefícios">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-center gap-4 p-4 rounded-lg hover:bg-background transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" aria-label="Categorias">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-display-md font-display font-bold">Categorias em Destaque</h2>
              <p className="text-muted-foreground mt-2">Descubra a nossa seleção curada por especialistas</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/category/all">Ver Todas <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden group',
                  category.featured && 'lg:col-span-2 lg:row-span-2'
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-[url('/images/placeholder-category.jpg')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                <div className="relative z-20 h-full flex flex-col justify-end p-6">
                  <Badge variant="premium" className="mb-2 w-fit">{category.count} produtos</Badge>
                  <h3 className="text-heading-lg font-display font-bold text-white">{category.name}</h3>
                  <p className="text-sm text-white/80 mt-1">Explorar coleção</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-muted/30" aria-label="Produtos em Destaque">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-display-md font-display font-bold">Produtos em Destaque</h2>
              <p className="text-muted-foreground mt-2">A nossa seleção dos melhores produtos do momento</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/collections/featured">Ver Coleção <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" aria-label="Call to action">
        <div className="container-custom">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-12 md:p-20 text-center">
            <div className="relative z-10 max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-6">Edição Limitada</Badge>
              <h2 className="text-display-lg font-display font-bold text-white mb-6">
                Série NEXUS One
              </h2>
              <p className="text-body-lg text-white/90 mb-8 max-w-xl mx-auto">
                A nossa linha exclusiva de tecnologia de ponta. Design minimalista, 
                materiais premium, performance extrema. Apenas 500 unidades por modelo.
              </p>
              <Button size="xl" variant="secondary" asChild className="w-full sm:w-auto">
                <Link href="/collections/nexus-one">Descobrir Série One <ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </div>
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section bg-muted/30" aria-label="Newsletter">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-display-md font-display font-bold mb-4">Mantenha-se Atualizado</h2>
            <p className="text-muted-foreground mb-8">
              Receba acesso antecipado a lançamentos, ofertas exclusivas e conteúdo premium.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="/api/newsletter" method="POST">
              <input
                type="email"
                name="email"
                placeholder="O seu melhor email"
                className="flex-1 h-12 rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
                autoComplete="email"
              />
              <Button type="submit" size="lg">Subscrever</Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              Sem spam. Cancele a qualquer momento. <Link href="/privacy" className="underline">Política de Privacidade</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product, index }: { product: typeof FEATURED_PRODUCTS[0]; index: number }) {
  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null

  return (
    <article className="group relative bg-card rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-[url('/images/placeholder-product.jpg')] bg-cover bg-center transition-transform duration-500 group-hover:scale-105" />
          {product.badge && (
            <Badge variant="premium" className="absolute top-3 left-3 z-10">{product.badge}</Badge>
          )}
          {discount && (
            <Badge variant="destructive" className="absolute top-3 right-3 z-10">-{discount}%</Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{formatCurrency(product.price)}</span>
              {product.compareAtPrice && (
                <span className="line-through">{formatCurrency(product.compareAtPrice)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <svg className="h-3 w-3 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>{product.rating}</span>
            <span className="text-muted-foreground/50">({product.reviews})</span>
          </div>
        </div>
      </Link>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 dark:bg-black/90 shadow-lg"
        aria-label={`Adicionar ${product.name} ao carrinho`}
      >
        <ShoppingBag className="h-5 w-5" />
      </Button>
    </article>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}