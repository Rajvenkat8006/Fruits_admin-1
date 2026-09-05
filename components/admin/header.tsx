'use client'

import { Menu, X, LogOut } from 'lucide-react'
import type { AuthUser } from '@/types'

export function Header({
  isSidebarOpen,
  toggleSidebar,
  user,
  onLogout,
}: {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  user: AuthUser | null
  onLogout: () => void
}) {
  const roleLabel =
    user?.role === 'SUPER_ADMIN'
      ? 'Super Admin'
      : user?.role === 'SUB_ADMIN'
        ? 'Sub Admin'
        : 'Admin'

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:left-64">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent lg:hidden">
          Fruitify
        </span>
        <span className="hidden lg:block text-sm text-gray-500">
          {user?.shop?.name ? `Shop · ${user.shop.name}` : 'Admin panel'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-gray-900">
            {user?.name || user?.email || 'Admin'}
          </span>
          <span className="text-xs text-gray-500">{roleLabel}</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
