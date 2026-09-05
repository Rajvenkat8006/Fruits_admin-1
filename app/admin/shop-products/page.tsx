'use client'

import { useEffect, useState } from 'react'

type Product = { id: string; name: string }
type Shop = { id: string; name: string }
type ShopProduct = {
  id: string
  price: number
  stock: number
  isAvailable: boolean
  product: { id: string; name: string; image: string | null }
  shop: { id: string; name: string }
}

export default function ShopProductsPage() {
  const [items, setItems] = useState<ShopProduct[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    productId: '',
    shopId: '',
    price: '',
    stock: '',
  })

  const load = async () => {
    const me = await fetch('/api/auth/me', { credentials: 'include' })
    const meData = await me.json()
    setRole(meData.user?.role || null)

    const [sp, p] = await Promise.all([
      fetch('/api/admin/shop-products', { credentials: 'include' }),
      fetch('/api/admin/products', { credentials: 'include' }),
    ])
    const spData = await sp.json()
    const pData = await p.json()
    if (!sp.ok) {
      setError(spData.error || 'Failed')
      return
    }
    setItems(spData)
    if (p.ok) setProducts(pData)

    if (meData.user?.role === 'SUPER_ADMIN') {
      const s = await fetch('/api/admin/shops', { credentials: 'include' })
      if (s.ok) setShops(await s.json())
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const body: Record<string, unknown> = {
      productId: form.productId,
      price: Number(form.price),
      stock: Number(form.stock || 0),
    }
    if (role === 'SUPER_ADMIN') body.shopId = form.shopId

    const res = await fetch('/api/admin/shop-products', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed')
      return
    }
    setForm({ productId: '', shopId: '', price: '', stock: '' })
    await load()
  }

  const updateStock = async (id: string, stock: number, price: number) => {
    await fetch(`/api/admin/shop-products/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock, price }),
    })
    await load()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shop Stock</h1>
        <p className="text-gray-500 mt-1">Per-shop price and inventory</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <form
        onSubmit={create}
        className="bg-white border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <select
          required
          className="border rounded-lg px-3 py-2"
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {role === 'SUPER_ADMIN' && (
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
        )}
        <input
          required
          type="number"
          step="0.01"
          placeholder="Price"
          className="border rounded-lg px-3 py-2"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Stock"
          className="border rounded-lg px-3 py-2"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <button
          type="submit"
          className="md:col-span-2 bg-green-600 text-white rounded-lg py-2"
        >
          Add / Update Shop Product
        </button>
      </form>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Shop</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Quick update</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.product.name}</td>
                <td className="px-4 py-3">{item.shop.name}</td>
                <td className="px-4 py-3">₹{item.price}</td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">{item.isAvailable ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-sm text-green-700 hover:underline"
                    onClick={() => {
                      const stock = prompt('New stock', String(item.stock))
                      const price = prompt('New price', String(item.price))
                      if (stock != null && price != null) {
                        updateStock(item.id, Number(stock), Number(price))
                      }
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No shop products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
