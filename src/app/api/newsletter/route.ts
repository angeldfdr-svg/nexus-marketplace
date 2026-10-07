import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    })

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ message: 'Já subscrito' }, { status: 200 })
      }
      // Reactivate
      await prisma.newsletterSubscription.update({
        where: { email },
        data: { active: true, unsubscribedAt: null },
      })
      return NextResponse.json({ message: 'Reativado com sucesso' })
    }

    await prisma.newsletterSubscription.create({
      data: { email },
    })

    return NextResponse.json({ message: 'Subscrito com sucesso' }, { status: 201 })
  } catch (error) {
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: 'Erro ao subscrever' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
    }

    await prisma.newsletterSubscription.update({
      where: { email },
      data: { active: false, unsubscribedAt: new Date() },
    })

    return NextResponse.json({ message: 'Cancelado com sucesso' })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json({ error: 'Erro ao cancelar subscrição' }, { status: 500 })
  }
}