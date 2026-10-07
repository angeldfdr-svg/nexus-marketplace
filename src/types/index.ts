import { Product, Category, User, Order, CartItem, Address, Review } from '@prisma/client'

export type { Product, Category, User, Order, CartItem, Address, Review }

export interface ProductWithRelations extends Product {
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
  inventory: Inventory | null
  reviews: ReviewWithUser[]
  _count: { reviews: number }
}

export interface ProductImage {
  id: string
  url: string
  alt: string | null
  position: number
}

export interface ProductVariant {
  id: string
  name: string
  value: string
  sku: string
  price: number | null
  inventory: Inventory | null
}

export interface Inventory {
  id: string
  quantity: number
  reserved: number
  lowStockThreshold: number
  trackQuantity: boolean
  allowBackorder: boolean
}

export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'name' | 'image'>
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[]
  _count: { products: number }
}

export interface CartItemWithProduct extends CartItem {
  product: Product & {
    images: ProductImage[]
    inventory: Inventory | null
    variants: ProductVariant[]
  }
  variant: ProductVariant | null
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: Pick<Product, 'id' | 'name' | 'slug' | 'images'>
    variant: Pick<ProductVariant, 'id' | 'name' | 'value'> | null
  })[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId: string | null
  name: string
  sku: string
  price: number
  quantity: number
  total: number
}

export interface AddressFormData {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  type: 'shipping' | 'billing'
}

export interface CheckoutFormData {
  email: string
  shippingAddress: AddressFormData
  billingAddress: AddressFormData
  sameAsShipping: boolean
  shippingMethod: string
  paymentMethod: 'stripe' | 'paypal' | 'multibanco'
  notes?: string
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  inStock?: boolean
  featured?: boolean
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SearchResult {
  products: ProductWithRelations[]
  categories: Category[]
  total: number
  query: string
  facets: {
    categories: { name: string; count: number }[]
    priceRanges: { min: number; max: number; count: number }[]
    tags: { name: string; count: number }[]
  }
}

export interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
  megaMenu?: {
    columns: {
      title: string
      links: { label: string; href: string }[]
    }[]
    featured?: {
      image: string
      title: string
      description: string
      href: string
    }
  }
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
    instagram: string
    linkedin: string
    youtube: string
  }
}

export const siteConfig: SiteConfig = {
  name: 'NEXUS',
  description: 'Premium Technology Marketplace — Curated innovation for the modern world',
  url: 'https://nexus.tech',
  ogImage: '/images/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/nexustech',
    github: 'https://github.com/nexus',
    instagram: 'https://instagram.com/nexustech',
    linkedin: 'https://linkedin.com/company/nexus',
    youtube: 'https://youtube.com/@nexustech',
  },
}

export const NAVIGATION: NavigationItem[] = [
  {
    label: 'Produtos',
    href: '/category/all',
    megaMenu: {
      columns: [
        {
          title: 'Drones & Robótica',
          links: [
            { label: 'Drones Profissionais', href: '/category/drones-pro' },
            { label: 'Drones FPV', href: '/category/drones-fpv' },
            { label: 'Robótica', href: '/category/robotics' },
            { label: 'Acessórios', href: '/category/drone-accessories' },
          ],
        },
        {
          title: 'Áudio Premium',
          links: [
            { label: 'Headphones', href: '/category/headphones' },
            { label: 'Earbuds', href: '/category/earbuds' },
            { label: 'Speakers', href: '/category/speakers' },
            { label: 'DACs & Amps', href: '/category/dacs-amps' },
          ],
        },
        {
          title: 'Smart Home Pro',
          links: [
            { label: 'Iluminação', href: '/category/smart-lighting' },
            { label: 'Segurança', href: '/category/security' },
            { label: 'Climatização', href: '/category/climate' },
            { label: 'Hubs & Control', href: '/category/hubs' },
          ],
        },
        {
          title: 'Fotografia & Vídeo',
          links: [
            { label: 'Câmeras Mirrorless', href: '/category/mirrorless' },
            { label: 'Lentes', href: '/category/lenses' },
            { label: 'Cinema', href: '/category/cinema' },
            { label: 'Acessórios', href: '/category/photo-accessories' },
          ],
        },
      ],
      featured: {
        image: '/images/mega-menu-featured.jpg',
        title: 'Série NEXUS One',
        description: 'Nossa linha exclusiva de tecnologia de ponta. Design minimalista, performance extrema.',
        href: '/category/nexus-one',
      },
    },
  },
  {
    label: 'Coleções',
    href: '/collections',
    children: [
      { label: 'NEXUS One', href: '/collections/nexus-one' },
      { label: 'Edição Limitada', href: '/collections/limited' },
      { label: 'Profissionais', href: '/collections/pro' },
      { label: 'Sustentáveis', href: '/collections/sustainable' },
    ],
  },
  {
    label: 'Suporte',
    href: '/support',
    children: [
      { label: 'Central de Ajuda', href: '/support' },
      { label: 'Garantia', href: '/warranty' },
      { label: 'Reparos', href: '/repairs' },
      { label: 'Documentação', href: '/docs' },
      { label: 'Contactar', href: '/contact' },
    ],
  },
  {
    label: 'Empresa',
    href: '/about',
    children: [
      { label: 'Sobre Nós', href: '/about' },
      { label: 'Imprensa', href: '/press' },
      { label: 'Carreiras', href: '/careers' },
      { label: 'Sustentabilidade', href: '/sustainability' },
      { label: 'Parceiros', href: '/partners' },
    ],
  },
]