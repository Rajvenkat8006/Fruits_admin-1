'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  List,
  Store,
  UserCog,
  Bike,
} from 'lucide-react'
import type { AppRole } from '@/types'

type NavItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
  roles: AppRole[]
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    name: 'Shops',
    href: '/admin/shops',
    icon: Store,
    roles: ['SUPER_ADMIN'],
  },
  {
    name: 'Sub-Admins',
    href: '/admin/sub-admins',
    icon: UserCog,
    roles: ['SUPER_ADMIN'],
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    name: 'Shop Stock',
    href: '/admin/shop-products',
    icon: Package,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: List,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    name: 'Banners',
    href: '/admin/banners',
    icon: Package,
    roles: ['SUPER_ADMIN'],
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    name: 'Delivery Boys',
    href: '/admin/delivery-boys',
    icon: Bike,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    name: 'Reviews',
    href: '/admin/reviews',
    icon: Users,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['SUPER_ADMIN'],
  },
]

export function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  role,
}: {
  isSidebarOpen: boolean
  setIsSidebarOpen: (v: boolean) => void
  role: AppRole | null
}) {
  const pathname = usePathname()
  const visible = navItems.filter(
    (item) => role && item.roles.includes(role)
  )

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Fruitify
          </span>
          <span className="ml-2 text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
            {role === 'SUPER_ADMIN' ? 'Super' : 'Shop'}
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {visible.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-green-50 text-green-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  size={20}
                  className={`mr-3 ${isActive ? 'text-green-600' : 'text-gray-400'}`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
