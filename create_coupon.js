const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const coupon = await prisma.coupon.upsert({
            where: { code: 'SUMMER50' },
            update: {},
            create: {
                code: 'SUMMER50',
                discountType: 'PERCENTAGE',
                value: 10,
                isActive: true,
                expiryDate: new Date('2025-12-31'),
                usageLimit: 100
            },
        });
        console.log('Coupon created:', coupon);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
