'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Eye, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    imageUrl: string
  }
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: newStatus })
      })

      if (res.ok) {
        fetchOrders() // Refresh list
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Update failed', error)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id)
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders and status</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8"></th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                        <div className="text-xs text-gray-500">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          className="text-sm border-gray-200 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900">Order Items</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-200">
                                  {item.product.imageUrl && (
                                    <div className="h-12 w-12 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden mr-4 relative">
                                      {/* Using standard img for external URLs if domain not configured in next.config.js, but user asked to fix warning. 
                                          If domains unknown, suppressing warning or unoptimizing is safer. 
                                          Let's use unoptimized Image. */}
                                      <Image
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium text-gray-900">{item.product.name}</h5>
                                    <p className="text-sm text-gray-500">
                                      {item.quantity} x ${item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    ${(item.quantity * item.price).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
