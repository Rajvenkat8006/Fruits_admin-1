export type Role = 'ADMIN' | 'USER'

export interface User {
    id: string
    name: string | null
    email: string | null
    role: Role
    createdAt: string
    updatedAt: string
}

export interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    image: string | null
    stock: number
    featured: boolean
    categoryId: string
    createdAt: string
    updatedAt: string
}

export interface Order {
    id: string
    userId: string
    total: number
    status: 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED'
    createdAt: string
    updatedAt: string
}
