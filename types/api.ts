import { User, Product, Order } from './index'

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface AuthResponse {
    token: string
    user: User
}

export interface UsersResponse extends ApiResponse<User[]> { }
export interface ProductsResponse extends ApiResponse<Product[]> { }
export interface OrdersResponse extends ApiResponse<Order[]> { }
