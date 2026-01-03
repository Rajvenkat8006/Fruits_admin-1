'use client'

import { useEffect, useState } from 'react'
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/admin/stats-card'

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalRevenue: number
  recentOrders: Array<{
    id: string
    user: string
    amount: number
    status: string
    date: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin') // Updated to root admin route
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your store&apos;s performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00"}
          change="+12.5%"
          isPositive={true}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders.toString() || "0"}
          change="+8.2%"
          isPositive={true}
          icon={ShoppingCart}
          color="bg-purple-500"
        />
        <StatCard
          title="Products"
          value={stats?.totalProducts.toString() || "0"}
          change="-2.1%"
          isPositive={false}
          icon={Package}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers.toString() || "0"}
          change="+14.5%"
          isPositive={true}
          icon={Users}
          color="bg-green-500"
        />
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <button className="text-sm text-green-600 font-medium hover:text-green-700 hover:underline">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.user}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${order.status === 'PAID' || order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
