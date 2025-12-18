'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface Banner {
    id: string
    title: string
    image: string
    link: string
    position: number
    isActive: boolean
    startDate: string | null
    endDate: string | null
    createdAt: string
}

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/banners')
            if (res.ok) {
                const data = await res.json()
                setBanners(data)
            }
        } catch (error) {
            console.error('Failed to fetch banners', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return

        try {
            // NOTE: DELETE endpoint might not be implemented yet based on my analysis, 
            // but adding the frontend logic for completeness. 
            // If it fails, it's a backend task to add it.
            const res = await fetch(`/api/admin/banners/${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setBanners(banners.filter(b => b.id !== id))
            } else {
                alert('Failed to delete banner')
            }
        } catch (error) {
            console.error('Failed to delete banner', error)
        }
    }

    const filteredBanners = banners.filter(banner =>
        banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.link?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
                    <p className="text-gray-500 mt-1">Manage your website banners and promotions</p>
                </div>
                <Link
                    href="/admin/banners/create"
                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
                >
                    <Plus size={20} className="mr-2" />
                    Add Banner
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search banners..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Banners Grid/List */}
            <div className="grid grid-cols-1 gap-6">
                {filteredBanners.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <p className="text-gray-500">No banners found</p>
                    </div>
                ) : (
                    filteredBanners.map(banner => (
                        <div key={banner.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                            <div className="sm:w-64 h-48 sm:h-auto relative bg-gray-100 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={banner.image}
                                    alt={banner.title || 'Banner'}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-sm">
                                    Pos: {banner.position}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{banner.title || 'Untitled Banner'}</h3>
                                            {banner.link && (
                                                <p className="text-sm text-gray-500 mt-1">Link: {banner.link}</p>
                                            )}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                        {banner.startDate && (
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>Start: {format(new Date(banner.startDate), 'MMM d, yyyy')}</span>
                                            </div>
                                        )}
                                        {banner.endDate && (
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>End: {format(new Date(banner.endDate), 'MMM d, yyyy')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-gray-50">
                                    {/* Actions could be expanded */}
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
