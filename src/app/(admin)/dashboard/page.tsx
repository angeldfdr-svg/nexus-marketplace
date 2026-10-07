import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from './admin-dashboard-client'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Painel de administração NEXUS',
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    redirect('/')
  }

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    lowStockProducts,
    topProducts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'SUCCEEDED' },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { include: { images: { take: 1 } } } } },
      },
    }),
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        inventory: { quantity: { lte: 10 } },
      },
      include: { inventory: true },
      take: 10,
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: { take: 1 },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const stats = {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.total || 0),
  }

  return <AdminDashboardClient 
    stats={stats} 
    recentOrders={recentOrders}
    lowStockProducts={lowStockProducts}
    topProducts={topProducts}
  />
}