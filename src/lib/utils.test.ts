import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, slugify, generateOrderNumber, truncate, getInitials } from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('handles tailwind conflicts', () => {
      expect(cn('p-2 p-4')).toBe('p-4')
    })
  })

  describe('formatCurrency', () => {
    it('formats EUR correctly', () => {
      expect(formatCurrency(100)).toBe('100,00 €')
      expect(formatCurrency(99.99)).toBe('99,99 €')
      expect(formatCurrency(0)).toBe('0,00 €')
    })

    it('handles string input', () => {
      expect(formatCurrency('150.50')).toBe('150,50 €')
    })
  })

  describe('slugify', () => {
    it('creates slug from string', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('NEXUS One Drone Pro')).toBe('nexus-one-drone-pro')
    })

    it('handles special characters', () => {
      expect(slugify('Café & Bar')).toBe('caf-bar')
      expect(slugify('São Paulo')).toBe('sao-paulo')
    })

    it('removes leading/trailing dashes', () => {
      expect(slugify('  Hello  ')).toBe('hello')
    })
  })

  describe('generateOrderNumber', () => {
    it('generates unique order numbers', () => {
      const order1 = generateOrderNumber()
      const order2 = generateOrderNumber()
      expect(order1).toMatch(/^NX-[A-Z0-9]+-[A-Z0-9]+$/)
      expect(order1).not.toBe(order2)
    })
  })

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello…')
      expect(truncate('Short', 10)).toBe('Short')
    })
  })

  describe('getInitials', () => {
    it('extracts initials from name', () => {
      expect(getInitials('João Silva')).toBe('JS')
      expect(getInitials('Maria')).toBe('M')
      expect(getInitials('A B C')).toBe('AB')
    })
  })
})