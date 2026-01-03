import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1]

        // Also check cookie if header is missing, consistent with other routes
        const cookieToken = request.cookies.get('token')?.value
        const validToken = token || cookieToken

        if (!validToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(validToken)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const orders = await prisma.order.findMany({
            where: { userId: payload.userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(orders)
    } catch (error) {
        console.error('Failed to fetch orders:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1]
        const cookieToken = request.cookies.get('token')?.value
        const validToken = token || cookieToken

        if (!validToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(validToken)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const userId = payload.userId

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { couponCode, shippingAddress, paymentMethod } = body;

        // 1. Get user's cart
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: { product: true }
        })

        if (!cartItems.length) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
        }

        // 1.1 Validate Status and Stock
        for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
                return NextResponse.json({
                    error: `Insufficient stock for product: ${item.product.name}. Available: ${item.product.stock}`
                }, { status: 400 })
            }
        }

        // 2. Calculate initial total
        let total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        let couponId = null;

        // 3. Handle Coupon Logic
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode }
            });

            if (coupon) {
                // Validate coupon
                const now = new Date();
                const isValid = coupon.isActive &&
                    (!coupon.expiryDate || new Date(coupon.expiryDate) > now) &&
                    (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);

                if (isValid) {
                    couponId = coupon.id;
                    let discountAmount = 0;
                    if (coupon.discountType === 'PERCENTAGE') {
                        discountAmount = (total * coupon.value) / 100;
                    } else {
                        discountAmount = coupon.value;
                    }
                    total = Math.max(0, total - discountAmount);
                } else {
                    return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 });
                }
            } else {
                return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
            }
        }

        // 4. Create Order in Transaction
        const order = await prisma.$transaction(async (tx) => {
            // Decrement Stock for each item
            for (const item of cartItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    status: 'PENDING',
                    couponId,
                    items: {
                        create: cartItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price
                        }))
                    }
                }
            });

            // Handle Shipping Address
            if (shippingAddress) {
                await tx.shippingAddress.create({
                    data: {
                        ...shippingAddress,
                        orderId: newOrder.id
                    }
                });
            }

            // Handle Payment Record
            if (paymentMethod) {
                await tx.payment.create({
                    data: {
                        orderId: newOrder.id,
                        method: paymentMethod,
                        amount: total, // Record the final amount to be paid
                        status: 'PENDING',
                        gateway: 'SYSTEM'
                    }
                });
            }

            // Increment Coupon Usage
            if (couponId) {
                await tx.coupon.update({
                    where: { id: couponId },
                    data: { usedCount: { increment: 1 } }
                });
            }

            // Clear Cart
            await tx.cart.deleteMany({
                where: { userId }
            });

            return newOrder;
        });

        // Fetch full order details to return
        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, image: true }
                        }
                    }
                },
                shippingAddress: true,
                payments: true, // or payment based on relation
                coupon: true
            }
        });

        return NextResponse.json(fullOrder, { status: 201 })
    } catch (error) {
        console.error('Failed to create order:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
    }
}
