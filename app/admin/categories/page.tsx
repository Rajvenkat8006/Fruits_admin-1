'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Loader2, Pencil, ImageIcon } from 'lucide-react'
import type { AppRole } from '@/types'

interface Category {
  id: string
  name: string
  slug?: string
  icon?: string | null
  _count?: { products: number }
}

function CategoryIcon({
  icon,
  name,
  selected,
  size = 'md',
}: {
  icon?: string | null
  name: string
  selected?: boolean
  size?: 'md' | 'lg'
}) {
  const dim = size === 'lg' ? 'h-20 w-20' : 'h-16 w-16'
  return (
    <div
      className={`${dim} rounded-full overflow-hidden bg-gray-100 border-2 flex items-center justify-center ${
        selected ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent'
      }`}
    >
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt={name} className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="text-gray-400" size={size === 'lg' ? 28 : 22} />
      )}
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<AppRole | null>(null)
  const [name, setName] = useState('')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  const isSuper = role === 'SUPER_ADMIN'

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' })
      if (res.ok) setCategories(await res.json())
    } catch (error) {
      console.error('Failed to fetch categories', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const me = await fetch('/api/auth/me', { credentials: 'include' })
      if (me.ok) {
        const data = await me.json()
        setRole(data.user?.role || null)
      }
      await fetchCategories()
    }
    init()
  }, [])

  useEffect(() => {
    if (!iconFile) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(iconFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [iconFile])

  useEffect(() => {
    if (!editFile) {
      setEditPreview(null)
      return
    }
    const url = URL.createObjectURL(editFile)
    setEditPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [editFile])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      if (iconFile) formData.append('icon', iconFile)

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (res.ok) {
        setName('')
        setIconFile(null)
        if (fileRef.current) fileRef.current.value = ''
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Create failed', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    try {
      const formData = new FormData()
      formData.append('name', editName.trim())
      if (editFile) formData.append('icon', editFile)

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      })
      if (res.ok) {
        setEditingId(null)
        setEditName('')
        setEditFile(null)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Update failed', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products using it may be affected.')) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) fetchCategories()
      else {
        const data = await res.json()
        alert(data.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Delete failed', error)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 mt-1">
          {isSuper
            ? 'Add fruit categories with circular icons for shops and the mobile app'
            : 'Select these categories when adding products — managed by Super Admin'}
        </p>
      </div>

      {isSuper && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-start"
        >
          <div className="flex flex-col items-center gap-2">
            <CategoryIcon icon={preview} name={name || 'New'} size="lg" />
            <label className="text-sm text-green-700 font-medium cursor-pointer hover:underline">
              Upload icon
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Apples, Mangoes, Berries"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} className="mr-2" />
              )}
              Add Category
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No categories yet.</p>
        ) : (
          <div className="flex flex-wrap gap-6 justify-start">
            {categories.map((cat) => (
              <div key={cat.id} className="w-28 flex flex-col items-center group">
                {editingId === cat.id && isSuper ? (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <CategoryIcon
                      icon={editPreview || cat.icon}
                      name={editName || cat.name}
                      size="lg"
                    />
                    <label className="text-xs text-green-700 cursor-pointer">
                      Change icon
                      <input
                        ref={editFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-sm px-2 py-1 border rounded"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdate(cat.id)}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null)
                          setEditFile(null)
                        }}
                        className="text-xs px-2 py-1 text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CategoryIcon icon={cat.icon} name={cat.name} size="lg" />
                    <p className="mt-2 text-sm font-medium text-gray-900 text-center line-clamp-2">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {cat._count?.products ?? 0} products
                    </p>
                    {isSuper && (
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(cat.id)
                            setEditName(cat.name)
                            setEditFile(null)
                          }}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
