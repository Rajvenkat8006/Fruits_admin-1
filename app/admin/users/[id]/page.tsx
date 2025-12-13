'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User as UserIcon, Mail } from 'lucide-react'

// TODO: Use shared User type
interface User {
    id: string
    name: string
    email: string
    role?: string
    createdAt: string
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/admin/users/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setUser(data)
                } else {
                    console.error('Failed to fetch user')
                }
            } catch (error) {
                console.error('Error fetching user', error)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [params.id])

    if (loading) return <div>Loading...</div>
    if (!user) return <div>User not found</div>

    return (
        <div className="space-y-6">
            <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900">
                <ArrowLeft size={20} className="mr-2" /> Back to Users
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-8">
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-3xl font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-6">
                        <h1 className="text-2xl font-bold text-gray-900">{user.name || 'Unnamed User'}</h1>
                        <div className="flex items-center text-gray-500 mt-2">
                            <Mail size={16} className="mr-2" /> {user.email}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-500 block">User ID</span>
                        <span className="font-mono text-gray-900">{user.id}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-500 block">Joined Date</span>
                        <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-500 block">Role</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role || 'USER'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
