export type AppRole = 'SUPER_ADMIN' | 'SUB_ADMIN' | 'DELIVERY_BOY' | 'USER'

export interface AuthUser {
  id: string
  name: string | null
  email: string | null
  role: AppRole
  shopId: string | null
  status?: string
  shop?: { id: string; name: string; status: string } | null
}

export interface User {
  id: string
  name: string | null
  email: string | null
  role: AppRole
  status?: string
  createdAt: string
  updatedAt?: string
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
  shopId?: string | null
  total: number
  status: string
  createdAt: string
  updatedAt: string
}
