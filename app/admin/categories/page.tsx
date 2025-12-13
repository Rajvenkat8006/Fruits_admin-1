'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, List } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  productCount?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory })
      })

      if (res.ok) {
        setNewCategory('')
        fetchCategories()
      } else {
        alert('Failed to create category')
      }
    } catch (error) {
      console.error('Create failed', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This might affect products in this category.')) return

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCategories()
      } else {
        alert('Failed to delete category')
      }
    } catch (error) {
      console.error('Delete failed', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 mt-1">Organize your products with categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Tropical Fruits"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !newCategory.trim()}
                className="w-full flex items-center justify-center py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} className="mr-2" />}
                Add Category
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {loading ? (
                <li className="p-6 text-center text-gray-500">Loading...</li>
              ) : categories.length === 0 ? (
                <li className="p-6 text-center text-gray-500">No categories found.</li>
              ) : (
                categories.map((cat) => (
                  <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mr-4">
                        <List size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{cat.name}</h3>
                        <p className="text-xs text-gray-500">ID: {cat.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
