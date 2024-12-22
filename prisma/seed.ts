import { PrismaClient, PriceType, PresetType, VstType, ItemType } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

async function main() {
  // First, delete PackPresets records
  await prisma.packPresets.deleteMany({})
  console.log('✅ Deleted existing pack presets')

  // Then delete preset uploads
  await prisma.presetUpload.deleteMany({})
  console.log('✅ Deleted existing preset uploads')

  // Then delete all existing users
  await prisma.user.deleteMany({})
  console.log('✅ Deleted existing users')

  // First, create the admin user and store the ID
  const adminUser = await prisma.user.create({
    data: {
      id: createId(),
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin User',
      updatedAt: new Date(),
    }
  });

  // Create VSTs first
  const vsts = await Promise.all([
    prisma.vST.upsert({
      where: { name: 'Serum' },
      update: {},
      create: {
        id: createId(),
        name: 'Serum',
        type: VstType.SYNTH,
      },
    }),
    prisma.vST.upsert({
      where: { name: 'Phase Plant' },
      update: {},
      create: {
        id: createId(),
        name: 'Phase Plant',
        type: VstType.SYNTH,
      },
    }),
    prisma.vST.upsert({
      where: { name: 'Vital' },
      update: {},
      create: {
        id: createId(),
        name: 'Vital',
        type: VstType.SYNTH,
      },
    }),
  ])

  // Create genres
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { name: 'Hardwave' },
      update: {},
      create: {
        id: createId(),
        name: 'Hardwave',
        type: 'SYSTEM',
        isSystem: true,
        updatedAt: new Date(),
      },
    }),
    prisma.genre.upsert({
      where: { name: 'Dnb' },
      update: {},
      create: {
        id: createId(),
        name: 'Phonk',
        type: 'SYSTEM',
        isSystem: true,
        updatedAt: new Date(),
      },
    }),
  ])

  // Create presets with proper relations
  const presets = await Promise.all([
    prisma.presetUpload.create({
      data: {
        id: createId(),
        title: 'Deep Bass Preset',
        description: 'Professional deep bass preset for modern productions',
        presetType: PresetType.BASS,
        priceType: PriceType.FREE,
        price: 0,
        userId: adminUser.id,
        vstId: vsts[0].id,
        genreId: genres[0].id,
        itemType: ItemType.PRESET,
        updatedAt: new Date(),
        tags: ['bass', 'deep', 'modern'],
      },
    }),
    prisma.presetUpload.create({
      data: {
        id: createId(),
        title: 'Ethereal Pad',
        description: 'Atmospheric pad perfect for ambient music',
        presetType: PresetType.PAD,
        priceType: PriceType.FREE,
        price: 4.99,
        userId: adminUser.id,
        vstId: vsts[1].id,
        genreId: genres[1].id,
        itemType: ItemType.PRESET,
        updatedAt: new Date(),
        tags: ['pad', 'ambient', 'atmospheric'],
      },
    }),
  ])

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
