'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, List } from 'lucide-react'

const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }, // Updated href
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: List },
    { name: 'Banners', href: '/admin/banners', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Reviews', href: '/admin/reviews', icon: Users }, // Using Users icon as placeholder, couldn't import Star/MessageCircle without checking imports
    { name: 'Users', href: '/admin/users', icon: Users },
]

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }: { isSidebarOpen: boolean, setIsSidebarOpen: (v: boolean) => void }) {
    const pathname = usePathname()

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="h-full flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        Fruitify
                    </span>
                    <span className="ml-2 text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Admin</span>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-green-50 text-green-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} className={`mr-3 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile & Logout - Could be separate but keeping here for now */}
                <div className="p-4 border-t border-gray-100">
                    {/* ... (Logout button would be here or passed as prop) */}
                </div>
            </div>
        </aside>
    )
}
