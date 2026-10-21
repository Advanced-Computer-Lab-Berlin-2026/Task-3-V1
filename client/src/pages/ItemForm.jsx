import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Report Item page — see README.md "Your task".
// This page is already routed at /items/new (report) and /items/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function loadItem() {
      try {
        const res = await api.get('/items/' + id)
        const item = res.data.item
        setForm({
          title: item.title || '',
          description: item.description || '',
          category: item.category || 'other',
          status: item.status || 'lost',
          location: item.location || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load item')
      }
    }

    loadItem()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        title: form.title,
        status: form.status,
        category: form.category,
        location: form.location,
        description: form.description
      }
      if (id) {
        await api.patch('/items/' + id, payload)
      } else {
        await api.post('/items', payload)
      }
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="block mb-1">Title</span>
          <input
            className="input"
            type="text"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Black backpack"
            required
          />
        </label>

        <label className="block">
          <span className="block mb-1">Status</span>
          <select className="input" name="status" value={form.status} onChange={onChange}>
            <option value="lost">lost</option>
            <option value="found">found</option>
            <option value="claimed">claimed</option>
          </select>
        </label>

        <label className="block">
          <span className="block mb-1">Category</span>
          <select className="input" name="category" value={form.category} onChange={onChange}>
            <option value="electronics">electronics</option>
            <option value="clothing">clothing</option>
            <option value="documents">documents</option>
            <option value="accessories">accessories</option>
            <option value="other">other</option>
          </select>
        </label>

        <label className="block">
          <span className="block mb-1">Location (optional)</span>
          <input
            className="input"
            type="text"
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Library 2nd floor"
          />
        </label>

        <label className="block">
          <span className="block mb-1">Description (optional)</span>
          <textarea
            className="input"
            name="description"
            value={form.description}
            onChange={onChange}
            rows="4"
          />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
