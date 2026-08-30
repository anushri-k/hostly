import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'plato2026'

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

  // Clean slate (idempotent reseed)
  await prisma.user.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.restaurant.deleteMany()

  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Riverside',
      tagline: 'Scan. Order. Enjoy.',
      email: 'hello@riverside.co',
      phone: '+1 (415) 555-0148',
      gst: 5,
      service: 10,
      branches: {
        create: [
          { name: 'Riverside', meta: 'Main · 24 tables', isMain: true },
          { name: 'Harbour Point', meta: '12 tables' },
          { name: 'Old Town', meta: '18 tables' },
        ],
      },
      users: {
        create: [
          { name: 'Maya Aronsson', email: 'maya@riverside.co', role: 'Owner', passwordHash },
          { name: 'Priya Shah', email: 'priya@riverside.co', role: 'Manager', passwordHash },
          { name: 'Devin Cole', email: 'devin@riverside.co', role: 'Cashier', passwordHash },
          { name: 'Tomas Reuben', email: 'tomas@riverside.co', role: 'Kitchen Supervisor', passwordHash },
          { name: 'Lena Fischer', email: 'lena@riverside.co', role: 'Cashier', passwordHash, status: 'Off shift' },
          { name: 'Omar Haddad', email: 'omar@riverside.co', role: 'Manager', passwordHash, status: 'Off shift' },
        ],
      },
    },
  })

  const users = await prisma.user.count()
  console.log(`Seeded restaurant "${restaurant.name}" with ${users} users.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
