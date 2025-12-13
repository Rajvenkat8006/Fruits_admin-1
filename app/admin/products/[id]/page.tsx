'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    return (
        <div className="space-y-6">
            <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900">
                <ArrowLeft size={20} className="mr-2" /> Back to Products
            </button>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold mb-4">Product Detail: {params.id}</h1>
                <p className="text-gray-500">Edit product form will go here.</p>
            </div>
        </div>
    )
}
