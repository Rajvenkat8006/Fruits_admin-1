'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import type { AppRole, AuthUser } from '@/types'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [role, setRole] = useState<AppRole | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setMounted(true)

    const loadMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
        const u = data.user as AuthUser
        if (u.role !== 'SUPER_ADMIN' && u.role !== 'SUB_ADMIN') {
          router.push('/login')
          return
        }
        setUser(u)
        setRole(u.role)
      } catch {
        router.push('/login')
      }
    }

    loadMe()
  }, [router])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      console.error('Logout failed', e)
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    router.push('/login')
    router.refresh()
  }

  if (!mounted || !role) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
        Loading admin...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Header
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex h-full w-full pt-16">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          role={role}
        />

        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-8 max-w-7xl mx-auto">
            {user?.shop?.name && (
              <p className="text-sm text-gray-500 mb-4 lg:hidden">
                Shop:{' '}
                <span className="font-medium text-gray-800">{user.shop.name}</span>
              </p>
            )}
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
