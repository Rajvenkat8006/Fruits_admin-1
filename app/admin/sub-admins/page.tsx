'use client'

import { useEffect, useState } from 'react'

type Shop = { id: string; name: string }
type SubAdmin = {
  id: string
  name: string | null
  email: string | null
  status: string
  shopId: string | null
  shop?: { id: string; name: string } | null
}

export default function SubAdminsPage() {
  const [items, setItems] = useState<SubAdmin[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    shopId: '',
  })

  const load = async () => {
    const [a, s] = await Promise.all([
      fetch('/api/admin/sub-admins', { credentials: 'include' }),
      fetch('/api/admin/shops', { credentials: 'include' }),
    ])
    const admins = await a.json()
    const shopList = await s.json()
    if (!a.ok) {
      setError(admins.error || 'Failed to load')
      return
    }
    setItems(admins)
    if (s.ok) setShops(shopList)
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/sub-admins', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed')
      return
    }
    setForm({ name: '', email: '', password: '', shopId: '' })
    await load()
  }

  const deactivate = async (id: string) => {
    await fetch(`/api/admin/sub-admins/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await load()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sub-Admins</h1>
        <p className="text-gray-500 mt-1">Assign shop managers</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <form
        onSubmit={create}
        className="bg-white border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          required
          placeholder="Name"
          className="border rounded-lg px-3 py-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          className="border rounded-lg px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="border rounded-lg px-3 py-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          required
          className="border rounded-lg px-3 py-2"
          value={form.shopId}
          onChange={(e) => setForm({ ...form, shopId: e.target.value })}
        >
          <option value="">Select shop</option>
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="md:col-span-2 bg-green-600 text-white rounded-lg py-2"
        >
          Create Sub-Admin
        </button>
      </form>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Shop</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.email}</td>
                <td className="px-4 py-3">{item.shop?.name || '—'}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  {item.status === 'ACTIVE' && (
                    <button
                      onClick={() => deactivate(item.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No sub-admins
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
