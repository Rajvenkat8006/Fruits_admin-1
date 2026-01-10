
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const userId = '693abd4c3022353005cc4a36'
    const user = await prisma.user.findUnique({ where: { id: userId } })
    console.log(`User with ID ${userId}:`, user ? 'FOUND' : 'NOT FOUND')

    if (!user) {
        const allUsers = await prisma.user.findMany({ select: { id: true } })
        console.log('Available User IDs:', allUsers.map(u => u.id))
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
