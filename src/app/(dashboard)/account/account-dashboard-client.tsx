'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Package, Heart, MapPin, Settings, LogOut, 
  ChevronRight, Truck, RotateCcw, Clock, CheckCircle, XCircle
} from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  PROCESSING: { label: 'A Processar', color: 'bg-purple-100 text-purple-800', icon: Truck },
  SHIPPED: { label: 'Enviada', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
  REFUNDED: { label: 'Reembolsada', color: 'bg-gray-100 text-gray-800', icon: RotateCcw },
} as const

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: Package, description: 'Visão geral da sua conta' },
  { href: '/account/orders', label: 'Encomendas', icon: Package, description: 'Histórico e estado das encomendas' },
  { href: '/account/addresses', label: 'Endereços', icon: MapPin, description: 'Gerir moradas de envio e faturação' },
  { href: '/account/wishlist', label: 'Lista de Desejos', icon: Heart, description: 'Produtos guardados para depois' },
  { href: '/account/settings', label: 'Configurações', icon: Settings, description: 'Perfil, password, notificações' },
]

interface AccountDashboardClientProps {
  user: any
  stats: { ordersCount: number; wishlistCount: number; addressesCount: number }
  recentOrders: any[]
}

export function AccountDashboardClient({ user, stats, recentOrders }: AccountDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState('dashboard')

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display-md font-display font-bold">Minha Conta</h1>
          <p className="text-muted-foreground mt-1">Gerencie o seu perfil, encomendas e preferências</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="w-full md:w-auto">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <TabsTrigger key={item.href} value={item.href.split('/').pop() || 'dashboard'}>
              <Link href={item.href} className="flex flex-col items-center gap-1 py-4">
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* User Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-semibold">{user.name || 'Utilizador'}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">Membro desde {new Date(user.createdAt).toLocaleDateString('pt-PT')}</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                  <Link href="/account/settings" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Settings className="h-4 w-4" />
                    Editar Perfil
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
              title="Encomendas" 
              value={stats.ordersCount} 
              icon={Package} 
              href="/account/orders"
              description="Ver histórico"
            />
            <StatCard 
              title="Lista de Desejos" 
              value={stats.wishlistCount} 
              icon={Heart} 
              href="/account/wishlist"
              description="Ver produtos"
            />
            <StatCard 
              title="Endereços" 
              value={stats.addressesCount} 
              icon={MapPin} 
              href="/account/addresses"
              description="Gerir moradas"
            />
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Encomendas Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/account/orders">Ver Todas <ChevronRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">Nenhuma encomenda ainda</h3>
                  <p className="text-muted-foreground mb-4">Comece a comprar para ver as suas encomendas aqui.</p>
                  <Button asChild>
                    <Link href="/category/all">Explorar Produtos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder tabs - would be separate pages in real app */}
        <TabsContent value="orders">
          <OrderListClient orders={recentOrders} />
        </TabsContent>

        <TabsContent value="addresses">
          <AddressesClient />
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistClient />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsClient user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, href, description }: { 
  title: string; value: number; icon: React.ComponentType<{ className?: string }>; href: string; description: string 
}) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <Link href={href} className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-display-sm font-display font-bold">{formatNumber(value)}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

function OrderRow({ order }: { order: any }) {
  const config = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || { 
    label: order.status, color: 'bg-gray-100 text-gray-800', icon: Clock 
  }
  const Icon = config.icon

  return (
    <Link href={`/account/orders/${order.id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          {order.items[0]?.product?.images?.[0] ? (
            <Image src={order.items[0].product.images[0].url} alt={order.items[0].product.name} fill className="object-cover rounded" sizes="48px" />
          ) : (
            <Package className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">
            {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} · {formatCurrency(Number(order.total))}
          </p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: pt })}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={config.color} variant="outline">
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  )
}

function OrderListClient({ orders }: { orders: any[] }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  )
}

function AddressesClient() {
  return (
    <Card>
      <CardContent className="pt-6 text-center py-8">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold mb-2">Gerir Endereços</h3>
        <p className="text-muted-foreground mb-6">Adicione, edite ou remova as suas moradas de envio e faturação.</p>
        <Button asChild>
          <Link href="/account/addresses">Gerir Endereços</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function WishlistClient() {
  return (
    <Card>
      <CardContent className="pt-6 text-center py-8">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold mb-2">Lista de Desejos</h3>
        <p className="text-muted-foreground mb-6">Veja os produtos que guardou para comprar mais tarde.</p>
        <Button asChild>
          <Link href="/account/wishlist">Ver Lista de Desejos</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function SettingsClient({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="mt-1">{user.name || 'Não definido'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1">{user.email}</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/account/settings">Editar Perfil</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/account/settings#password">Alterar Password</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full">Eliminar Conta</Button>
          <p className="text-xs text-muted-foreground text-center mt-2">Esta ação é irreversível.</p>
        </CardContent>
      </Card>
    </div>
  )
}