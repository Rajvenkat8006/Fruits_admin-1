import { PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@fruitify.com'
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123'
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin'

  const hashed = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        password: hashed,
        name,
        shopId: null,
      },
    })
    console.log(`Updated SUPER_ADMIN: ${email}`)
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
    })
    console.log(`Created SUPER_ADMIN: ${email}`)
  }

  console.log(`Password: ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
