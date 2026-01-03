import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code) {
            return NextResponse.json(
                { message: "Coupon code is required" },
                { status: 400 }
            );
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code },
        });

        if (!coupon) {
            return NextResponse.json(
                { message: "Invalid coupon code" },
                { status: 404 }
            );
        }

        if (!coupon.isActive) {
            return NextResponse.json(
                { message: "This coupon is no longer active" },
                { status: 400 }
            );
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return NextResponse.json(
                { message: "This coupon has expired" },
                { status: 400 }
            );
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json(
                { message: "This coupon usage limit has been reached" },
                { status: 400 }
            );
        }

        let discountAmount = 0;

        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (cartTotal * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }

        // Ensure discount doesn't exceed cart total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        return NextResponse.json({
            valid: true,
            discountType: coupon.discountType,
            value: coupon.value,
            discountAmount,
            code: coupon.code,
            id: coupon.id
        });

    } catch (error) {
        console.error("Coupon verification error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
