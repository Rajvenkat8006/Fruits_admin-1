'use client'

import { useState, useEffect } from 'react'
import { Trash2, Star, Search, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Review {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: {
        name: string | null
        email: string | null
    }
    product: {
        name: string
        image: string | null
    }
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews')
            if (res.ok) {
                const data = await res.json()
                setReviews(data)
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return

        try {
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== id))
            } else {
                alert('Failed to delete review')
            }
        } catch (error) {
            console.error('Failed to delete review', error)
        }
    }

    const filteredReviews = reviews.filter(review =>
        review.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 size={30} className="animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
                <p className="text-gray-500 mt-1">Manage customer reviews and ratings</p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No reviews found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Comment</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {review.product.image && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={review.product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                )}
                                                <span className="font-medium text-gray-900 line-clamp-1 max-w-[150px]" title={review.product.name}>
                                                    {review.product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{review.user.name || 'Anonymous'}</span>
                                                <span className="text-xs text-gray-500">{review.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-yellow-500">
                                                <span className="font-bold mr-1">{review.rating}</span>
                                                <Star size={14} fill="currentColor" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={review.comment || ''}>
                                                {review.comment || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Review"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
