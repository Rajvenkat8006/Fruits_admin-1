'use client'

import { Menu, X } from 'lucide-react'

export function Header({ isSidebarOpen, toggleSidebar }: { isSidebarOpen: boolean, toggleSidebar: () => void }) {
    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Fruitify Admin</span>
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100">
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
    )
}
