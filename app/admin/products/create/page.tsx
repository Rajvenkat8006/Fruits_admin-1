'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Loader2, ImageIcon } from 'lucide-react'

type Category = {
  id: string
  name: string
  icon?: string | null
}

export default function CreateProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories', {
          credentials: 'include',
        })
        if (res.ok) {
          setCategories(await res.json())
        }
      } catch (error) {
        console.error('Failed to fetch categories', error)
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.categoryId) {
      alert('Please select a category')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl,
        }),
      })

      if (res.ok) {
        router.push('/admin/products')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create product')
      }
    } catch (error) {
      console.error('Failed to create product', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link
          href="/admin/products"
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-1">
            Pick a category icon, then fill product details
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category
          </label>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500">
              No categories yet. Super Admin must add categories with icons first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {categories.map((cat) => {
                const selected = formData.categoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, categoryId: cat.id })
                    }
                    className="w-24 flex flex-col items-center focus:outline-none"
                  >
                    <div
                      className={`h-16 w-16 rounded-full overflow-hidden bg-gray-100 border-2 flex items-center justify-center transition-all ${
                        selected
                          ? 'border-green-500 ring-2 ring-green-200 scale-105'
                          : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      {cat.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cat.icon}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-gray-400" size={22} />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center line-clamp-2 ${
                        selected
                          ? 'font-semibold text-green-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          {!formData.categoryId && (
            <p className="text-xs text-amber-600 mt-2">Select a category to continue</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Organic Bananas"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            required
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Describe the product..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
              <Upload size={16} />
            </span>
            <input
              type="url"
              required
              className="flex-1 px-4 py-2 rounded-r-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !formData.categoryId}
            className="w-full flex items-center justify-center py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Creating Product...
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
