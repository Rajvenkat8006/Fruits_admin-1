import { LoginForm } from '@/components/forms/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Fruitify Admin
          </h1>
          <p className="text-gray-500 mt-2">Sign in to manage your store</p>
        </div>

        <LoginForm />

        <p className="text-sm text-center mt-6 text-gray-500">
          Dont have an account?{' '}
          <Link href="/register" className="text-green-600 font-medium hover:underline">
            Register (Admin)
          </Link>
        </p>
      </div>
    </div>
  )
}
