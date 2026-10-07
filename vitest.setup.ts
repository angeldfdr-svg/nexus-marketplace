import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: null,
      status: 'unauthenticated',
    }
  },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme() {
    return {
      theme: 'light',
      setTheme: vi.fn(),
      resolvedTheme: 'light',
    }
  },
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => ({
    confirmPayment: vi.fn(),
  }),
  useElements: () => ({
    getElement: vi.fn(),
  }),
  PaymentElement: () => <div data-testid="payment-element" />,
}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
    product: { findMany: vi.fn(), findUnique: vi.fn() },
    category: { findMany: vi.fn(), findUnique: vi.fn() },
    order: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    cartItem: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    wishlist: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    address: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    review: { findMany: vi.fn(), create: vi.fn() },
    analyticsEvent: { create: vi.fn() },
    newsletterSubscription: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    siteSettings: { findUnique: vi.fn(), upsert: vi.fn() },
    $transaction: vi.fn((cb) => cb(vi.fn())),
  },
}))

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})