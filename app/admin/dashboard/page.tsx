'use client'

import { useEffect, useState } from 'react'
import { Users, Package, ShoppingCart, DollarSign, Store, Bike } from 'lucide-react'
import { StatCard } from '@/components/admin/stats-card'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { credentials: 'include' })
        if (res.ok) {
          setStats(await res.json())
        }
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>
  }

  const isSuper = stats?.role === 'SUPER_ADMIN'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {isSuper ? 'Platform overview' : "Your shop's performance today"}
        </p>
      </div>

      {isSuper ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={stats ? `₹${Number(stats.totalRevenue || 0).toFixed(2)}` : '₹0.00'}
            icon={DollarSign}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Orders"
            value={String(stats?.totalOrders || 0)}
            icon={ShoppingCart}
            color="bg-purple-500"
          />
          <StatCard
            title="Shops"
            value={String(stats?.totalShops || 0)}
            icon={Store}
            color="bg-orange-500"
          />
          <StatCard
            title="Users"
            value={String(stats?.totalUsers || 0)}
            icon={Users}
            color="bg-green-500"
          />
          <StatCard
            title="Delivery Boys"
            value={String(stats?.totalDeliveryBoys || 0)}
            icon={Bike}
            color="bg-teal-500"
          />
          <StatCard
            title="Products"
            value={String(stats?.totalProducts || 0)}
            icon={Package}
            color="bg-amber-500"
          />
          <StatCard
            title="Today Orders"
            value={String(stats?.todayOrders || 0)}
            icon={ShoppingCart}
            color="bg-indigo-500"
          />
          <StatCard
            title="Pending"
            value={String(stats?.pendingOrders || 0)}
            icon={ShoppingCart}
            color="bg-rose-500"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today Sales"
            value={`₹${Number(stats?.todaySales || 0).toFixed(2)}`}
            icon={DollarSign}
            color="bg-blue-500"
          />
          <StatCard
            title="Today Orders"
            value={String(stats?.todayOrders || 0)}
            icon={ShoppingCart}
            color="bg-purple-500"
          />
          <StatCard
            title="Pending"
            value={String(stats?.pendingOrders || 0)}
            icon={ShoppingCart}
            color="bg-orange-500"
          />
          <StatCard
            title="Preparing"
            value={String(stats?.preparingOrders || 0)}
            icon={Package}
            color="bg-amber-500"
          />
          <StatCard
            title="Ready"
            value={String(stats?.readyOrders || 0)}
            icon={Package}
            color="bg-teal-500"
          />
          <StatCard
            title="Delivered"
            value={String(stats?.deliveredOrders || 0)}
            icon={ShoppingCart}
            color="bg-green-500"
          />
          <StatCard
            title="Low Stock"
            value={String(stats?.lowStock || 0)}
            icon={Package}
            color="bg-rose-500"
          />
          <StatCard
            title="Delivery Boys"
            value={String(stats?.activeDeliveryBoys || 0)}
            icon={Bike}
            color="bg-indigo-500"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                {isSuper && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Shop</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(stats?.recentOrders || []).map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.user}</td>
                  {isSuper && (
                    <td className="px-6 py-4 text-sm text-gray-600">{order.shop || '—'}</td>
                  )}
                  <td className="px-6 py-4 text-sm font-semibold">
                    ₹{Number(order.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">{order.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!stats?.recentOrders?.length && (
                <tr>
                  <td colSpan={isSuper ? 6 : 5} className="px-6 py-8 text-center text-gray-400">
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
