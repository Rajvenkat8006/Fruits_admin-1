import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/users/[id] - Get Single User
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: { id: true, name: true, email: true,  createdAt: true }
        })
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE /api/admin/users/[id] - Delete User
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // TODO: Strict Admin Check (Wait for RBAC implementation)

        await prisma.user.delete({ where: { id: params.id } })
        return NextResponse.json({ message: 'User deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}
