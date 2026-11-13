
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  title: '',
  description: '',
  category: 'other',
  status: 'lost',
  location: ''
}

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)

  // Load existing item when editing
  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadItem() {
      setLoading(true)
      setError('')

      try {
        const res = await api.get(`/items/${id}`)
        const item = res.data.item

        if (!cancelled) {
          setForm({
            title: item.title || '',
            description: item.description || '',
            category: item.category || 'other',
            status: item.status || 'lost',
            location: item.location || ''
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || 'Failed to load item'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadItem()

    return () => {
      cancelled = true
    }
  }, [id])

  // Update form state when typing or selecting
  function onChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Create a new item or edit an existing one
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (id) {
        await api.patch(`/items/${id}`, form)
      } else {
        await api.post('/items', form)
      }

      nav('/items')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save item'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-center mt-8">Loading item...</p>
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-2">
        {id ? 'Edit Item' : 'Report an Item'}
      </h1>

      <p className="text-gray-500 text-sm mb-5">
        {id
          ? 'Update the details of your reported item.'
          : 'Help the campus community find lost belongings.'}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Item title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={onChange}
            placeholder="e.g. Black backpack"
            required
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={onChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={onChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="documents">Documents</option>
            <option value="accessories">Accessories</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Location (optional)
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={onChange}
            placeholder="e.g. Library 2nd floor"
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={onChange}
            placeholder="Describe the item..."
            className="w-full border rounded-lg p-2"
          />
        </div>

        {error && (
          <div role="alert" className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            className="btn"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : id ? 'Save Changes' : 'Report Item'}
          </button>

          <button
            className="border rounded-lg px-4 py-2"
            type="button"
            onClick={() => nav('/items')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
