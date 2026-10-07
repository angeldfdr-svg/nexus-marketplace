'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users, Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle,
  ChevronRight, MoreHorizontal, Search, Filter, Plus, Download
} from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'A Processar', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'Enviada', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Reembolsada', color: 'bg-gray-100 text-gray-800' },
} as const

interface AdminDashboardClientProps {
  stats: { totalUsers: number; totalProducts: number; totalOrders: number; totalRevenue: number }
  recentOrders: any[]
  lowStockProducts: any[]
  topProducts: any[]
}

export function AdminDashboardClient({ stats, recentOrders, lowStockProducts, topProducts }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = React.useState('overview')

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display-md font-display font-bold">Painel de Administração</h1>
          <p className="text-muted-foreground mt-1">Visão geral e gestão da loja</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/dashboard/products">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Utilizadores" value={stats.totalUsers} icon={Users} color="blue" />
        <StatCard title="Produtos" value={stats.totalProducts} icon={Package} color="purple" />
        <StatCard title="Encomendas" value={stats.totalOrders} icon={ShoppingBag} color="indigo" />
        <StatCard title="Receita Total" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="green" isCurrency />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="orders">Encomendas Recentes</TabsTrigger>
          <TabsTrigger value="low-stock">Stock Baixo</TabsTrigger>
          <TabsTrigger value="top-products">Top Produtos</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <QuickAction href="/admin/dashboard/products" icon={Plus} label="Adicionar Produto" description="Criar novo produto no catálogo" />
                <QuickAction href="/admin/dashboard/orders" icon={ShoppingBag} label="Gerir Encomendas" description="Ver e atualizar estados" />
                <QuickAction href="/admin/dashboard/users" icon={Users} label="Gerir Utilizadores" description="Ver contas e permissões" />
                <QuickAction href="/admin/dashboard/analytics" icon={TrendingUp} label="Analytics" description="Relatórios de vendas" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowStockProducts.length > 0 && (
                  <AlertItem 
                    icon={AlertTriangle} 
                    color="yellow" 
                    title={`${lowStockProducts.length} produtos com stock baixo`}
                    description="Verificar e repor inventário"
                    href="/admin/dashboard/products?filter=low-stock"
                  />
                )}
                {recentOrders.filter(o => o.status === 'PENDING').length > 0 && (
                  <AlertItem 
                    icon={ShoppingBag} 
                    color="blue" 
                    title={`${recentOrders.filter(o => o.status === 'PENDING').length} encomendas pendentes`}
                    description="Processar encomendas aguardando confirmação"
                    href="/admin/dashboard/orders?status=PENDING"
                  />
                )}
                <AlertItem 
                  icon={Package} 
                  color="green" 
                  title="Sistema operacional"
                  description="Todos os serviços a funcionar normalmente"
                />
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Receita (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gráfico de receita (implementar com Recharts/Chart.js)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Orders */}
        <TabsContent value="orders">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Encomendas Recentes</CardTitle>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                    <SelectItem value="PROCESSING">A Processar</SelectItem>
                    <SelectItem value="SHIPPED">Enviada</SelectItem>
                    <SelectItem value="DELIVERED">Entregue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Encomenda</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(Number(order.total))}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.color}>
                          {STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={order.paymentStatus === 'SUCCEEDED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: pt })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/dashboard/orders/${order.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Stock */}
        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Produtos com Stock Baixo (≤ 10 unidades)</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Stock Atual</TableHead>
                      <TableHead>Reservado</TableHead>
                      <TableHead>Disponível</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => {
                      const available = (product.inventory?.quantity || 0) - (product.inventory?.reserved || 0)
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Link href={`/admin/dashboard/products/${product.id}`} className="font-medium hover:text-primary">
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell>{product.inventory?.quantity || 0}</TableCell>
                          <TableCell>{product.inventory?.reserved || 0}</TableCell>
                          <TableCell className={cn('font-medium', available <= 0 ? 'text-destructive' : available <= 5 ? 'text-yellow-600' : 'text-green-600')}>
                            {available}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/dashboard/products/${product.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-semibold mb-2">Stock OK</h3>
                  <p className="text-muted-foreground">Todos os produtos têm stock suficiente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products */}
        <TabsContent value="top-products">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {topProducts.map((product) => (
                  <AdminProductCard key={product.id} product={product} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, isCurrency }: { 
  title: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color: string; isCurrency?: boolean 
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn('text-display-sm font-display font-bold', isCurrency ? '' : 'mt-1')}>{value}</p>
          </div>
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', `${color}-100`)} >
            <Icon className={cn('h-6 w-6', `${color}-600`)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickAction({ href, icon: Icon, label, description }: { 
  href: string; icon: React.ComponentType<{ className?: string }>; label: string; description: string 
}) {
  return (
    <Link href={href} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  )
}

function AlertItem({ icon: Icon, color, title, description, href }: { 
  icon: React.ComponentType<{ className?: string }>; color: string; title: string; description: string; href?: string 
}) {
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border', `${color}-50 border-${color}-200`)}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', `${color}-100`)} >
        <Icon className={cn('h-4 w-4', `${color}-600`)} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {href && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={href}>Ver <ChevronRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      )}
    </div>
  )
}

function AdminProductCard({ product }: { product: any }) {
  return (
    <Link href={`/admin/dashboard/products/${product.id}`} className="group block bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative overflow-hidden bg-muted">
        {product.images?.[0] ? (
          <Image src={product.images[0].url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        {product.featured && <Badge variant="premium" className="absolute top-2 left-2">Destaque</Badge>}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-sm">{formatCurrency(Number(product.price))}</span>
          <Badge variant="outline" className={product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {product.status}
          </Badge>
        </div>
      </div>
    </Link>
  )
}