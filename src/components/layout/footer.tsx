'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Truck, Shield, RotateCcw, Headphones, Award } from 'lucide-react'
import { siteConfig } from '@/types'

const FOOTER_LINKS = {
  produto: [
    { label: 'Todos os Produtos', href: '/category/all' },
    { label: 'Novidades', href: '/collections/new' },
    { label: 'Mais Vendidos', href: '/collections/bestsellers' },
    { label: 'Ofertas', href: '/collections/sale' },
    { label: 'Edição Limitada', href: '/collections/limited' },
    { label: 'Marcas', href: '/brands' },
  ],
  suporte: [
    { label: 'Central de Ajuda', href: '/support' },
    { label: 'Contactar', href: '/contact' },
    { label: 'Estado da Encomenda', href: '/account/orders' },
    { label: 'Envios e Entregas', href: '/shipping' },
    { label: 'Devoluções', href: '/returns' },
    { label: 'Garantia', href: '/warranty' },
    { label: 'Reparos', href: '/repairs' },
    { label: 'Manuais', href: '/docs' },
  ],
  empresa: [
    { label: 'Sobre Nós', href: '/about' },
    { label: 'Imprensa', href: '/press' },
    { label: 'Carreiras', href: '/careers' },
    { label: 'Sustentabilidade', href: '/sustainability' },
    { label: 'Parceiros', href: '/partners' },
    { label: 'Afiliados', href: '/affiliates' },
  ],
  legal: [
    { label: 'Termos de Serviço', href: '/terms' },
    { label: 'Política de Privacidade', href: '/privacy' },
    { label: 'Política de Cookies', href: '/cookies' },
    { label: 'Aviso Legal', href: '/legal' },
    { label: 'Acessibilidade', href: '/accessibility' },
  ],
}

const FEATURES = [
  { icon: Truck, label: 'Envio Grátis', description: 'Encomendas > 100€' },
  { icon: RotateCcw, label: 'Devoluções 30 dias', description: 'Sem complicações' },
  { icon: Shield, label: 'Pagamento Seguro', description: 'Certificado SSL' },
  { icon: Headphones, label: 'Suporte Especializado', description: 'Seg-Sex 9h-19h' },
  { icon: Award, label: 'Garantia Oficial', description: 'Produtos Originais' },
]

const SOCIAL_LINKS = [
  { icon: Instagram, href: siteConfig.links.instagram, label: 'Instagram' },
  { icon: Twitter, href: siteConfig.links.twitter, label: 'Twitter' },
  { icon: Youtube, href: siteConfig.links.youtube, label: 'YouTube' },
  { icon: Linkedin, href: siteConfig.links.linkedin, label: 'LinkedIn' },
  { icon: Facebook, href: siteConfig.links.facebook, label: 'Facebook' },
]

const PAYMENT_METHODS = [
  { label: 'Visa', icon: '💳' },
  { label: 'Mastercard', icon: '💳' },
  { label: 'PayPal', icon: '🅿️' },
  { label: 'Multibanco', icon: '🏧' },
  { label: 'MB WAY', icon: '📱' },
  { label: 'Klarna', icon: '🔵' },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container-custom py-16 lg:py-24">
        {/* Main Links Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6" aria-label="NEXUS - Página inicial">
              <svg className="h-10 w-10 text-primary" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" className="fill-current" />
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-display text-2xl font-bold tracking-tight">NEXUS</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Tecnologia premium curada para quem exige o melhor. Inovação, design e performance em cada produto.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <nav aria-label="Produtos">
            <h3 className="font-semibold mb-4">Produtos</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.produto.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support Links */}
          <nav aria-label="Suporte">
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.suporte.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company Links */}
          <nav aria-label="Empresa">
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.empresa.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal + Newsletter */}
          <div>
            <nav aria-label="Legal">
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 mb-8">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold mb-3">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Receba novidades, ofertas exclusivas e acesso antecipado.
              </p>
              <form className="flex gap-2" action="/api/newsletter" method="POST">
                <input
                  type="email"
                  name="email"
                  placeholder="O seu email"
                  className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  autoComplete="email"
                />
                <button type="submit" className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Subscrever
                </button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Ao subscrever, aceita a nossa <Link href="/privacy" className="underline hover:text-primary">Política de Privacidade</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 pt-16 border-t">
          <div className="grid gap-8 md:grid-cols-5">
            {FEATURES.map((feature) => (
              <div key={feature.label} className="flex gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4 text-center">Métodos de Pagamento</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
            {PAYMENT_METHODS.map((method) => (
              <span key={method.label} className="text-sm font-medium flex items-center gap-1">
                {method.icon} {method.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Termos</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            <Link href="/accessibility" className="hover:text-primary transition-colors">Acessibilidade</Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Feito em Portugal 🇵🇹</span>
          </div>
        </div>
      </div>
    </footer>
  )
}