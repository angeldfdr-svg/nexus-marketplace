'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItemWithProduct } from '@/types'

interface CartState {
  items: CartItemWithProduct[]
  isOpen: boolean
  addItem: (item: Omit<CartItemWithProduct, 'createdAt' | 'updatedAt'>) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )

          if (existingIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += item.quantity
            return { items: newItems }
          }

          return { items: [...state.items, { ...item, createdAt: new Date(), updatedAt: new Date() }] }
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        })),

      updateQuantity: (productId, quantity, variantId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.max(1, quantity), updatedAt: new Date() }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((sum, item) => {
          const price = item.variant?.price ?? item.product.price
          return sum + Number(price) * item.quantity
        }, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'nexus_cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)