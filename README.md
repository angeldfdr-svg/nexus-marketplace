# NEXUS — Premium Technology Marketplace

Um marketplace de tecnologia premium inspirado no design minimalista da **Stark Future** e na funcionalidade completa da **Tek4Life**.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Radix UI (shadcn/ui)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials, Google, GitHub)
- **Payments**: Stripe (Checkout, Webhooks, Multibanco, MB WAY)
- **State**: Zustand (cart) + TanStack Query (server state)
- **Animations**: Framer Motion + CSS
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel / Docker

## ✨ Funcionalidades

### Frontend (Cliente)
- 🏠 **Homepage** - Hero animado, stats, categorias em destaque, produtos featured, CTA newsletter
- 🛍️ **Catálogo** - Filtros avançados (preço, tags, stock), ordenação, paginação, vista grid/lista
- 📦 **Produto** - Galeria imagens, variantes, quantidade, specs, avaliações, produtos relacionados
- 🛒 **Carrinho** - Drawer lateral + página completa, quantidade, códigos promo, trust signals
- 💳 **Checkout** - 3 passos (info, envio, pagamento), Stripe Elements, Multibanco, MB WAY
- ✅ **Sucesso** - Confirmação, tracking, próximos passos
- 👤 **Conta** - Dashboard, encomendas, endereços, wishlist, settings
- 🔐 **Auth** - Login, registo, password reset, OAuth

### Backend (Admin)
- 📊 **Dashboard** - Métricas vendas, encomendas recentes, produtos low stock
- 📦 **Produtos** - CRUD completo, imagens, variantes, inventory, SEO
- 📋 **Encomendas** - Lista, detalhes, update status, tracking, export
- 👥 **Utilizadores** - Lista, roles, detalhes, encomendas
- 📈 **Analytics** - Vendas por período, top produtos, conversão

### UX/UI Premium
- 🌙 **Dark/Light mode** - System preference + manual toggle
- ♿ **Acessibilidade** - WCAG 2.1 AA, keyboard nav, screen readers
- 📱 **Mobile-first** - Responsive, touch gestures, PWA ready
- ✨ **Animações** - Framer Motion, stagger, hover states, loading skeletons
- 🎨 **Design System** - Tokens, componentes consistentes, glass morphism

## 📦 Instalação

```bash
# Clone e entre no diretório
cd premium-tech-marketplace

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Configure banco de dados
npm run db:generate
npm run db:push
npm run db:seed

# Inicie desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor desenvolvimento
npm run build        # Build produção
npm run start        # Servidor produção
npm run lint         # ESLint
npm run db:generate  # Prisma generate
npm run db:push      # Push schema para DB
npm run db:migrate   # Migrações
npm run db:studio    # Prisma Studio
npm run db:seed      # Seed dados demo
```

## 🗄️ Modelo de Dados Principal

```
User → Orders → OrderItems → Product
  ↓         ↓
Address   Payment
  ↓
CartItem → Product (Variant)
Wishlist → Product
Review → Product

Category (hierárquica) → Product
Product → Images, Variants, Inventory, Specs, Reviews
```

## 🔐 Variáveis de Ambiente Obrigatórias

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Chave secreta (32+ chars) |
| `NEXTAUTH_URL` | URL da aplicação |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe |
| `STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret Stripe |

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte repositório ao Vercel
2. Adicione variáveis de ambiente
3. Configure PostgreSQL (Vercel Postgres / Neon / Supabase)
4. Deploy automático

### Docker
```bash
docker build -t nexus-marketplace .
docker run -p 3000:3000 --env-file .env nexus-marketplace
```

### Stripe Webhooks
Configure no Stripe Dashboard:
```
https://seu-dominio.com/api/webhooks/stripe
Eventos: checkout.session.completed, payment_intent.payment_failed, charge.refunded
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, register, reset
│   ├── (dashboard)/       # Área cliente (protegida)
│   ├── (shop)/            # Loja pública
│   │   ├── category/[slug]
│   │   ├── product/[slug]
│   │   ├── cart
│   │   └── checkout
│   ├── (admin)/           # Admin (protegida)
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Componentes base (shadcn)
│   ├── layout/            # Header, Footer
│   ├── product/           # Product cards, gallery
│   ├── cart/              # Cart drawer, summary
│   ├── checkout/          # Checkout steps
│   └── admin/             # Admin tables, forms
├── lib/                   # Utils, Prisma, Auth, Stripe
├── hooks/                 # Custom hooks (cart, toast)
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── styles/                # Globals, Tailwind
```

## 🎨 Personalização

### Cores (tailwind.config.ts)
```typescript
colors: {
  primary: { DEFAULT: 'hsl(var(--primary))', ... },
  // Edite em src/styles/globals.css :root
}
```

### Fontes (layout.tsx)
```typescript
const inter = Inter({ variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ variable: '--font-space-grotesk' })
```

## 📝 Licença

MIT License - veja [LICENSE](LICENSE)

## 🤝 Contribuir

1. Fork o projeto
2. Crie branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit (`git commit -m 'feat: nova funcionalidade'`)
4. Push (`git push origin feature/nova-funcionalidade`)
5. Abra Pull Request

## 📞 Suporte

- Email: support@nexus.tech
- Docs: /docs
- Issues: GitHub Issues

---

**NEXUS** — Tecnologia que eleva a experiência.