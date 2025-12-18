'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'

export default function CreateBannerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        link: '',
        position: '0',
        isActive: true,
        startDate: '',
        endDate: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    position: parseInt(formData.position),
                    startDate: formData.startDate || undefined,
                    endDate: formData.endDate || undefined
                })
            })

            if (res.ok) {
                router.push('/admin/banners')
            } else {
                const errorData = await res.json()
                alert('Failed to create banner: ' + JSON.stringify(errorData))
            }
        } catch (error) {
            console.error('Failed to create banner', error)
            alert('An error occurred while creating the banner')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center">
                <Link href="/admin/banners" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Banner</h1>
                    <p className="text-gray-500 mt-1">Create a promotional banner for the store</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title (Optional)</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="e.g., Summer Sale"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                            <Upload size={16} />
                        </span>
                        <input
                            type="url"
                            required
                            className="flex-1 px-4 py-2 rounded-r-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="https://example.com/banner.jpg"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter a direct link to the banner image</p>
                    {formData.image && (
                        <div className="mt-2 relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Link */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Link (Optional)</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="/products/category/fruits"
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                    />
                </div>

                {/* Position & Status */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position / Order</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            value={formData.position}
                            onChange={e => setFormData({ ...formData, position: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center h-full pt-6">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Optional)</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>


                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin mr-2" />
                                Creating Banner...
                            </>
                        ) : (
                            'Create Banner'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
