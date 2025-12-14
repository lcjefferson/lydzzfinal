import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

async function main() {
  const prisma = new PrismaClient()
  try {
    const orgName = 'Minha Empresa'
    const orgSlug = orgName.toLowerCase().replace(/\s+/g, '-')

    let organization = await prisma.organization.findFirst({ where: { slug: orgSlug } })
    if (!organization) {
      organization = await prisma.organization.create({
        data: { name: orgName, slug: orgSlug }
      })
    }

    const email = 'admin@smarterchat.com'
    const name = 'Admin User'
    const passwordHash = await bcrypt.hash('senha123', 10)

    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        password: passwordHash,
        role: 'admin',
        organizationId: organization.id
      }
    })

    console.log('Admin criado:')
    console.log({ email, senha: 'senha123' })
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

