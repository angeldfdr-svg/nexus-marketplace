'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, ShoppingBag, User, Sun, Moon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { NAVIGATION } from '@/types'

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl transition-all duration-300">
      <nav className="container-custom" aria-label="Navegação principal">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="NEXUS - Página inicial">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" className="fill-current" />
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display text-xl font-bold tracking-tight">NEXUS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {NAVIGATION.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Pesquisar">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Alternar tema">
              <Sun className="h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <Moon className="h-5 w-5 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
            </Button>

            <Link href="/account/wishlist" className="relative">
              <Button variant="ghost" size="icon" aria-label="Lista de desejos">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Carrinho">
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>

            <UserMenu />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Pesquisar">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Alternar tema">
              <Sun className="h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <Moon className="h-5 w-5 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Carrinho">
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <MobileNav onClose={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <SearchModal onClose={() => setSearchOpen(false)} />
      )}
    </header>
  )
}

function NavItem({ item }: { item: typeof NAVIGATION[0] }) {
  if (item.megaMenu) {
    return <MegaMenuItem item={item} />
  }
  if (item.children) {
    return <DropdownNavItem item={item} />
  }
  return (
    <Link
      href={item.href}
      className={cn(
        'px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
        pathname === item.href ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {item.label}
    </Link>
  )
}

function DropdownNavItem({ item }: { item: typeof NAVIGATION[0] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {item.label}
          <ChevronDown className="h-4 w-4" />
        </Link>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8}>
        {item.children?.map((child) => (
          <DropdownMenuItem key={child.href} asChild>
            <Link href={child.href}>{child.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MegaMenuItem({ item }: { item: typeof NAVIGATION[0] }) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {item.label}
          <ChevronDown className="h-4 w-4" />
        </Link>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-[56rem] p-0">
        <div className="grid grid-cols-4 gap-6 p-6 md:grid-cols-5">
          {item.megaMenu?.columns.map((column, i) => (
            <div key={i}>
              <h4 className="mb-3 text-sm font-semibold text-foreground">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {item.megaMenu?.featured && (
            <div className="col-span-4 md:col-span-5 mt-6 rounded-xl overflow-hidden bg-muted">
              <Link href={item.megaMenu.featured.href} className="block">
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <p className="text-sm font-medium text-primary mb-2">EM DESTAQUE</p>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{item.megaMenu.featured.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.megaMenu.featured.description}</p>
                    <Button variant="outline" size="sm">Explorar</Button>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/images/avatar-placeholder.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/account">Painel</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders">Encomendas</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/addresses">Endereços</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/wishlist">Lista de Desejos</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account/settings">Configurações</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" asChild>
          <Link href="/api/auth/signout">Sair</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileNav({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-display text-lg font-bold">Menu</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAVIGATION.map((item) => (
          <MobileNavItem key={item.href} item={item} onClose={onClose} />
        ))}
      </nav>
      <div className="border-t p-4">
        <Link href="/account" className="flex items-center gap-3 text-sm font-medium" onClick={onClose}>
          <User className="h-5 w-5" />
          Minha Conta
        </Link>
      </div>
    </div>
  )
}

function MobileNavItem({ item, onClose }: { item: typeof NAVIGATION[0]; onClose: () => void }) {
  if (item.children) {
    return (
      <div>
        <button className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-foreground">
          {item.label}
          <ChevronDown className="h-4 w-5" />
        </button>
        <ul className="ml-4 mt-1 space-y-1 border-l border-muted pl-3">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link href={child.href} className="block px-2 py-1.5 text-sm text-muted-foreground hover:text-primary" onClick={onClose}>
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <Link
      href={item.href}
      className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary"
      onClick={onClose}
    >
      {item.label}
    </Link>
  )
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 animate-slide-down">
        <div className="glass-strong rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 p-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar produtos, categorias, marcas..."
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoComplete="off"
            />
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar pesquisa">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground">Resultados para: <span className="font-medium">{query || 'digite para pesquisar'}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}