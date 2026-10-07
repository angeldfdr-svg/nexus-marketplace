import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AccountDashboardClient } from './account-dashboard-client'

export const metadata: Metadata = {
  title: 'Minha Conta',
  description: 'Gerencie a sua conta, encomendas, endereços e preferências',
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/account')
  }

  const [user, ordersCount, wishlistCount, addressesCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { addresses: true },
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.wishlist.count({ where: { userId: session.user.id } }),
    prisma.address.count({ where: { userId: session.user.id } }),
  ])

  if (!user) {
    redirect('/login')
  }

  const recentOrders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return <AccountDashboardClient 
    user={user} 
    stats={{ ordersCount, wishlistCount, addressesCount }}
    recentOrders={recentOrders}
  />
}