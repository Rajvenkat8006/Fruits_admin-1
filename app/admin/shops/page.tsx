'use client'

import { useEffect, useState } from 'react'

type Shop = {
  id: string
  name: string
  address: string | null
  phone: string | null
  status: string
  latitude: number | null
  longitude: number | null
  users?: { id: string; name: string | null; email: string | null }[]
  _count?: { users: number; shopProducts: number; orders: number }
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: '',
  })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shops', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load shops')
      setShops(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const createShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          address: form.address || null,
          phone: form.phone || null,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create shop')
      setForm({ name: '', address: '', phone: '', latitude: '', longitude: '' })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (shop: Shop) => {
    const next = shop.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    const res = await fetch(`/api/admin/shops/${shop.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) await load()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shops</h1>
        <p className="text-gray-500 mt-1">Create and manage fruit shops</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <form
        onSubmit={createShop}
        className="bg-white border border-gray-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          required
          placeholder="Shop name"
          className="border rounded-lg px-3 py-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Phone"
          className="border rounded-lg px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Address"
          className="border rounded-lg px-3 py-2 md:col-span-2"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <input
          placeholder="Latitude"
          className="border rounded-lg px-3 py-2"
          value={form.latitude}
          onChange={(e) => setForm({ ...form, latitude: e.target.value })}
        />
        <input
          placeholder="Longitude"
          className="border rounded-lg px-3 py-2"
          value={form.longitude}
          onChange={(e) => setForm({ ...form, longitude: e.target.value })}
        />
        <button
          type="submit"
          disabled={saving}
          className="md:col-span-2 bg-green-600 text-white rounded-lg py-2 font-medium disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Add Shop'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Sub-Admins</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{shop.name}</div>
                    <div className="text-xs text-gray-500">{shop.address}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(shop.users || []).map((u) => u.name || u.email).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">{shop._count?.shopProducts ?? 0}</td>
                  <td className="px-4 py-3">{shop._count?.orders ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        shop.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(shop)}
                      className="text-sm text-green-700 hover:underline"
                    >
                      {shop.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
              {!shops.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No shops yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
