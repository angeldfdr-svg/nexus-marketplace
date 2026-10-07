import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexus.tech' },
    update: {},
    create: {
      email: 'admin@nexus.tech',
      name: 'Admin NEXUS',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create demo user
  const demoPassword = await hash('demo123', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@nexus.tech' },
    update: {},
    create: {
      email: 'demo@nexus.tech',
      name: 'Demo User',
      passwordHash: demoPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Demo user created:', demo.email)

  // Create categories
  const categories = await Promise.all([
    // Drones & Robotics
    prisma.category.upsert({
      where: { slug: 'drones-robotics' },
      update: {},
      create: {
        name: 'Drones & Robótica',
        slug: 'drones-robotics',
        description: 'Drones profissionais, FPV, robótica e acessórios',
        sortOrder: 1,
      },
    }),
    // Audio
    prisma.category.upsert({
      where: { slug: 'audio' },
      update: {},
      create: {
        name: 'Áudio Premium',
        slug: 'audio',
        description: 'Headphones, earbuds, speakers, DACs e amplificadores high-end',
        sortOrder: 2,
      },
    }),
    // Smart Home
    prisma.category.upsert({
      where: { slug: 'smart-home' },
      update: {},
      create: {
        name: 'Smart Home Pro',
        slug: 'smart-home',
        description: 'Iluminação, segurança, climatização e hubs inteligentes',
        sortOrder: 3,
      },
    }),
    // Photography
    prisma.category.upsert({
      where: { slug: 'photo-video' },
      update: {},
      create: {
        name: 'Fotografia & Vídeo',
        slug: 'photo-video',
        description: 'Câmeras mirrorless, lentes, cinema e acessórios profissionais',
        sortOrder: 4,
      },
    }),
    // Wearables
    prisma.category.upsert({
      where: { slug: 'wearables' },
      update: {},
      create: {
        name: 'Wearables & Saúde',
        slug: 'wearables',
        description: 'Smartwatches, trackers, monitores de saúde e óculos inteligentes',
        sortOrder: 5,
      },
    }),
    // Computing
    prisma.category.upsert({
      where: { slug: 'computing' },
      update: {},
      create: {
        name: 'Computing & Acessórios',
        slug: 'computing',
        description: 'Portáteis, monitores, periféricos e componentes high-performance',
        sortOrder: 6,
      },
    }),
  ])

  console.log('✅ Categories created')

  // Create subcategories
  const [dronesCat, audioCat, smartHomeCat, photoCat, wearablesCat, computingCat] = categories

  const subcategories = await Promise.all([
    // Drones subcategories
    prisma.category.upsert({
      where: { slug: 'drones-pro' },
      update: {},
      create: { name: 'Drones Profissionais', slug: 'drones-pro', parentId: dronesCat.id, sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'drones-fpv' },
      update: {},
      create: { name: 'Drones FPV', slug: 'drones-fpv', parentId: dronesCat.id, sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'robotics' },
      update: {},
      create: { name: 'Robótica', slug: 'robotics', parentId: dronesCat.id, sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'drone-accessories' },
      update: {},
      create: { name: 'Acessórios', slug: 'drone-accessories', parentId: dronesCat.id, sortOrder: 4 },
    }),

    // Audio subcategories
    prisma.category.upsert({
      where: { slug: 'headphones' },
      update: {},
      create: { name: 'Headphones', slug: 'headphones', parentId: audioCat.id, sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'earbuds' },
      update: {},
      create: { name: 'Earbuds', slug: 'earbuds', parentId: audioCat.id, sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'speakers' },
      update: {},
      create: { name: 'Speakers', slug: 'speakers', parentId: audioCat.id, sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'dacs-amps' },
      update: {},
      create: { name: 'DACs & Amps', slug: 'dacs-amps', parentId: audioCat.id, sortOrder: 4 },
    }),

    // Smart Home subcategories
    prisma.category.upsert({
      where: { slug: 'smart-lighting' },
      update: {},
      create: { name: 'Iluminação', slug: 'smart-lighting', parentId: smartHomeCat.id, sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'security' },
      update: {},
      create: { name: 'Segurança', slug: 'security', parentId: smartHomeCat.id, sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'climate' },
      update: {},
      create: { name: 'Climatização', slug: 'climate', parentId: smartHomeCat.id, sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'hubs' },
      update: {},
      create: { name: 'Hubs & Control', slug: 'hubs', parentId: smartHomeCat.id, sortOrder: 4 },
    }),

    // Photo subcategories
    prisma.category.upsert({
      where: { slug: 'mirrorless' },
      update: {},
      create: { name: 'Câmeras Mirrorless', slug: 'mirrorless', parentId: photoCat.id, sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'lenses' },
      update: {},
      create: { name: 'Lentes', slug: 'lenses', parentId: photoCat.id, sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'cinema' },
      update: {},
      create: { name: 'Cinema', slug: 'cinema', parentId: photoCat.id, sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'photo-accessories' },
      update: {},
      create: { name: 'Acessórios', slug: 'photo-accessories', parentId: photoCat.id, sortOrder: 4 },
    }),

    // Wearables subcategories
    prisma.category.upsert({
      where: { slug: 'smartwatches' },
      update: {},
      create: { name: 'Smartwatches', slug: 'smartwatches', parentId: wearablesCat.id, sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'health-trackers' },
      update: {},
      create: { name: 'Trackers de Saúde', slug: 'health-trackers', parentId: wearablesCat.id, sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'smart-glasses' },
      update: {},
      create: { name: 'Óculos Inteligentes', slug: 'smart-glasses', parentId: wearablesCat.id, sortOrder: 3 },
    }),

    // Computing subcategories
    prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: { name: 'Portáteis', slug: 'laptops', parentId: computingCat.id, sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'monitors' },
      update: {},
      create: { name: 'Monitores', slug: 'monitors', parentId: computingCat.id, sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'peripherals' },
      update: {},
      create: { name: 'Periféricos', slug: 'peripherals', parentId: computingCat.id, sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'components' },
      update: {},
      create: { name: 'Componentes', slug: 'components', parentId: computingCat.id, sortOrder: 4 },
    }),
  ])

  console.log('✅ Subcategories created')

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      siteName: 'NEXUS',
      siteDescription: 'Premium Technology Marketplace',
      defaultCurrency: 'EUR',
      taxRate: 23,
      freeShippingThreshold: 100,
      metaTitle: 'NEXUS — Premium Technology Marketplace',
      metaDescription: 'Descubra tecnologia premium curada. Drones, áudio, smart home, fotografia e muito mais.',
    },
  })
  console.log('✅ Site settings created')

  // Create sample products
  const products = [
    // Drones
    {
      name: 'NEXUS One Drone Pro',
      slug: 'nexus-one-drone-pro',
      description: 'O drone profissional definitivo. Câmara 8K, voo autónomo de 45min, evasão de obstáculos 360°. Construído em fibra de carbono aeroespacial.',
      shortDesc: 'Drone profissional 8K com 45min de voo',
      sku: 'NX-DR-PRO-001',
      price: 2499,
      compareAtPrice: 2799,
      categoryId: dronesCat.id,
      featured: true,
      tags: ['Lançamento', 'Profissional', '8K', 'Autónomo'],
      specifications: {
        'Câmara': '8K 60fps / 48MP',
        'Tempo de Voo': '45 minutos',
        'Alcance': '15 km',
        'Peso': '890g',
        'Evasão Obstáculos': '360° omnidirecional',
        'Controlador': 'Ecrã 5.5" 1000 nits',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800', alt: 'NEXUS One Drone Pro', position: 0 },
        { url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', alt: 'Drone em voo', position: 1 },
      ],
      inventory: { quantity: 25, lowStockThreshold: 5 },
    },
    {
      name: 'NEXUS One FPV Racer',
      slug: 'nexus-one-fpv-racer',
      description: 'Drone FPV de competição. Latência ultra-baixa, 120km/h, estrutura em carbono T700. Para pilotos exigentes.',
      shortDesc: 'FPV racer 120km/h carbono T700',
      sku: 'NX-DR-FPV-001',
      price: 899,
      compareAtPrice: 999,
      categoryId: dronesCat.id,
      featured: true,
      tags: ['FPV', 'Competição', 'Carbono'],
      specifications: {
        'Velocidade Máx': '120 km/h',
        'Latência': '< 5ms',
        'Estrutura': 'Carbono T700',
        'Motores': '2306 1950KV',
        'Câmara': '1200TVL baixa latência',
        'Peso': '320g (sem bateria)',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800', alt: 'FPV Racer', position: 0 },
      ],
      inventory: { quantity: 15, lowStockThreshold: 3 },
    },

    // Audio
    {
      name: 'Auric X1 Planar Magnetic',
      slug: 'auric-x1-planar-magnetic',
      description: 'Headphones planar magnéticos de referência. Drivers 14.2mm, resposta 10Hz-50kHz, impedância 16Ω. Conforto supremo para sessões longas.',
      shortDesc: 'Planar magnéticos 14.2mm referência',
      sku: 'NX-AU-X1-001',
      price: 899,
      categoryId: audioCat.id,
      featured: true,
      tags: ['Best Seller', 'Planar', 'Referência'],
      specifications: {
        'Driver': 'Planar Magnético 14.2mm',
        'Resposta Frequência': '10Hz - 50kHz',
        'Impedância': '16Ω',
        'Sensibilidade': '96dB',
        'Peso': '380g',
        'Cabo': 'Desamovível 4.4mm balanceado',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'Auric X1 Headphones', position: 0 },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800', alt: 'Detalhe headphones', position: 1 },
      ],
      inventory: { quantity: 40, lowStockThreshold: 10 },
    },
    {
      name: 'Auric TWS Pro',
      slug: 'auric-tws-pro',
      description: 'Earbuds true wireless com ANC adaptativo, LDAC, 8h bateria (32h com case). Driver dinâmico 10mm + balanced armature.',
      shortDesc: 'TWS ANC LDAC 8h/32h dual driver',
      sku: 'NX-AU-TWS-001',
      price: 299,
      compareAtPrice: 349,
      categoryId: audioCat.id,
      featured: false,
      tags: ['TWS', 'ANC', 'LDAC'],
      specifications: {
        'Driver': 'Dinâmico 10mm + BA',
        'ANC': 'Adaptativo -45dB',
        'Codec': 'LDAC, AAC, SBC',
        'Bateria': '8h / 32h (case)',
        'Carregamento': 'USB-C + Wireless',
        'Resistência': 'IPX4',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', alt: 'Auric TWS Pro', position: 0 },
      ],
      inventory: { quantity: 60, lowStockThreshold: 15 },
    },

    // Smart Home
    {
      name: 'Lumina Smart Light Kit Pro',
      slug: 'lumina-smart-light-kit-pro',
      description: 'Kit iluminação inteligente completo. 4 lâmpadas RGBWW Matter, 2 fitas LED, 1 hub Thread. Controlo por voz, app, automações.',
      shortDesc: 'Kit 4 lâmpadas + 2 fitas + hub Matter',
      sku: 'NX-SH-LUM-001',
      price: 349,
      compareAtPrice: 399,
      categoryId: smartHomeCat.id,
      featured: true,
      tags: ['Matter', 'Thread', 'Kit Completo'],
      specifications: {
        'Lâmpadas': '4x RGBWW E27 1100lm',
        'Fitas LED': '2x 2m RGBWW IP65',
        'Hub': 'Thread + Matter + Zigbee',
        'Protocolo': 'Matter over Thread',
        'Voz': 'Alexa, Google, Siri, Bixby',
        'App': 'NEXUS Home (iOS/Android)',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800', alt: 'Lumina Smart Light Kit', position: 0 },
      ],
      inventory: { quantity: 35, lowStockThreshold: 8 },
    },
    {
      name: 'Sentinel Pro Security Cam',
      slug: 'sentinel-pro-security-cam',
      description: 'Câmara segurança 4K HDR, IA local, visão noturna colorida, bateria 6 meses, armazenamento local + cloud opcional.',
      shortDesc: '4K HDR IA local bateria 6 meses',
      sku: 'NX-SH-SEN-001',
      price: 279,
      categoryId: smartHomeCat.id,
      featured: false,
      tags: ['4K', 'IA Local', 'Bateria Longa'],
      specifications: {
        'Resolução': '4K HDR 8MP',
        'Visão Noturna': 'Colorida até 15m',
        'IA': 'Local (pessoas, veículos, animais)',
        'Bateria': '6 meses (uso normal)',
        'Armazenamento': 'MicroSD 256GB + Cloud opcional',
        'Resistência': 'IP66',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1557322435-3086a3c9e1a5?w=800', alt: 'Sentinel Pro Cam', position: 0 },
      ],
      inventory: { quantity: 50, lowStockThreshold: 10 },
    },

    // Photography
    {
      name: 'Optic R5 Mark II',
      slug: 'optic-r5-mark-ii',
      description: 'Mirrorless full-frame 45MP, vídeo 8K RAW, AF IA deep learning, estabilização 8 stops. O padrão profissional.',
      shortDesc: 'Full-frame 45MP 8K RAW AF IA',
      sku: 'NX-PH-R5M2-001',
      price: 3899,
      categoryId: photoCat.id,
      featured: true,
      tags: ['Profissional', '8K RAW', '45MP'],
      specifications: {
        'Sensor': 'Full-frame 45MP CMOS',
        'Vídeo': '8K 60p RAW / 4K 120p',
        'AF': 'Deep Learning IA (olhos, animais, veículos)',
        'Estabilização': 'IBIS 8 stops',
        'Disparos': '30fps eletrónico / 12fps mecânico',
        'Ecrã': '3.2" 2.1M pontos articulado',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', alt: 'Optic R5 Mark II', position: 0 },
        { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', alt: 'Câmara em uso', position: 1 },
      ],
      inventory: { quantity: 12, lowStockThreshold: 3 },
    },
    {
      name: 'Optic RF 24-70mm F2.8L IS USM',
      slug: 'optic-rf-24-70mm-f28l',
      description: 'Lente standard zoom profissional. Abertura constante f/2.8, IS 5 stops, nano USM, revestimentos ASC/SWC. Nitidez corner-to-corner.',
      shortDesc: 'Zoom padrão f/2.8 IS 5 stops',
      sku: 'NX-PH-RF2470-001',
      price: 2499,
      categoryId: photoCat.id,
      featured: false,
      tags: ['Lente', 'Profissional', 'F2.8'],
      specifications: {
        'Focal': '24-70mm',
        'Abertura': 'f/2.8 constante',
        'Estabilização': '5 stops IS',
        'Foco': 'Nano USM silencioso',
        'Revestimento': 'ASC + SWC',
        'Construção': '18 elementos 13 grupos',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1616839047159-3813e688b4c1?w=800', alt: 'RF 24-70mm F2.8L', position: 0 },
      ],
      inventory: { quantity: 20, lowStockThreshold: 5 },
    },

    // Wearables
    {
      name: 'Vital X Smartwatch',
      slug: 'vital-x-smartwatch',
      description: 'Smartwatch saúde avançado. ECG, SpO2, temperatura, sono, stress, VO2 max. Titânio, safira, 14 dias bateria. Certificado médico.',
      shortDesc: 'ECG SpO2 Temp Titânio 14 dias',
      sku: 'NX-WE-VIT-001',
      price: 599,
      compareAtPrice: 699,
      categoryId: wearablesCat.id,
      featured: true,
      tags: ['Saúde', 'ECG', 'Certificado Médico'],
      specifications: {
        'Ecrã': '1.4" AMOLED Always-On',
        'Sensores': 'ECG, SpO2, Temp, HR, GPS',
        'Saúde': 'Certificado FDA/CE médico',
        'Bateria': '14 dias / 30h GPS',
        'Material': 'Titânio grau 5 + Safira',
        'Resistência': '10 ATM / IP68',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', alt: 'Vital X Smartwatch', position: 0 },
      ],
      inventory: { quantity: 30, lowStockThreshold: 8 },
    },

    // Computing
    {
      name: 'NEXUS Book Pro 16',
      slug: 'nexus-book-pro-16',
      description: 'Portátil profissional 16". M3 Max 14C CPU/30C GPU, 48GB RAM, 1TB SSD, Liquid Retina XDR 120Hz. Unibody alumínio reciclado.',
      shortDesc: 'M3 Max 48GB 1TB XDR 120Hz',
      sku: 'NX-CO-BP16-001',
      price: 3499,
      categoryId: computingCat.id,
      featured: true,
      tags: ['Profissional', 'M3 Max', 'XDR'],
      specifications: {
        'Chip': 'M3 Max 14C CPU / 30C GPU',
        'Memória': '48GB unificada',
        'Armazenamento': '1TB SSD',
        'Ecrã': '16.2" Liquid Retina XDR 120Hz',
        'Bateria': '22h reprodução vídeo',
        'Portas': '3x TB4, HDMI, SDXC, MagSafe 3',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'NEXUS Book Pro 16', position: 0 },
      ],
      inventory: { quantity: 10, lowStockThreshold: 2 },
    },
    {
      name: 'UltraVision 32" 4K 144Hz',
      slug: 'ultravision-32-4k-144hz',
      description: 'Monitor profissional 32" 4K 144Hz, Mini-LED 1152 zonas, 1000 nits sustentado, 99% DCI-P3, calibração fábrica Delta E<1.',
      shortDesc: '32" 4K 144Hz Mini-LED 1000 nits',
      sku: 'NX-CO-UV32-001',
      price: 1299,
      compareAtPrice: 1499,
      categoryId: computingCat.id,
      featured: true,
      tags: ['Mini-LED', '144Hz', 'Calibrado'],
      specifications: {
        'Painel': '32" IPS Mini-LED 1152 zonas',
        'Resolução': '4K UHD 3840x2160',
        'Taxa Atualização': '144Hz',
        'Brilho': '1000 nits sustentado / 1600 nits pico',
        'Cor': '99% DCI-P3, 100% sRGB',
        'Calibração': 'Delta E < 1 fábrica',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', alt: 'UltraVision 32"', position: 0 },
      ],
      inventory: { quantity: 18, lowStockThreshold: 5 },
    },
  ]

  for (const productData of products) {
    const { images, inventory, ...product } = productData

    const existing = await prisma.product.findUnique({ where: { sku: product.sku } })
    if (existing) continue

    const created = await prisma.product.create({
      data: {
        ...product,
        images: { create: images },
        inventory: { create: inventory },
      },
    })
    console.log(`✅ Product created: ${created.name}`)
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
