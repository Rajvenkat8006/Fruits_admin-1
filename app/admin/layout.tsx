'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Removed usePathname as it's in Sidebar
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { LogOut } from 'lucide-react' // Import LogOut

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout failed', e)
    }
    router.push('/login')
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex h-full w-full">
        {/* Sidebar Wrapper or direct usage */}
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto lg:pt-0 pt-16 w-full">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden glass-effect"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
