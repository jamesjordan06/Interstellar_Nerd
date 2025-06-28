'use client'

import { useSession } from 'next-auth/react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface SpaceFact {
  id: string
  fact: string
  category: string
  source: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function SpaceFactsAdminPage() {
  const { data: session } = useSession()
  const [facts, setFacts] = useState<SpaceFact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingFact, setEditingFact] = useState<SpaceFact | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFact, setNewFact] = useState({
    fact: '',
    category: 'general',
    source: ''
  })

  const categories = [
    'general', 'cosmology', 'planets', 'stars', 'moon', 'sun', 'earth',
    'galaxy', 'black-holes', 'meteors', 'moons', 'space-station'
  ]

  useEffect(() => {
    fetchFacts()
  }, [])

  const fetchFacts = async () => {
    try {
      const response = await fetch('/api/space-facts?mode=all')
      if (response.ok) {
        const data = await response.json()
        setFacts(data.facts)
      }
    } catch (error) {
      console.error('Error fetching facts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/space-facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFact)
      })

      if (response.ok) {
        setNewFact({ fact: '', category: 'general', source: '' })
        setShowAddForm(false)
        fetchFacts()
      }
    } catch (error) {
      console.error('Error adding fact:', error)
    }
  }

  const handleUpdateFact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFact) return

    try {
      const response = await fetch('/api/admin/space-facts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFact)
      })

      if (response.ok) {
        setEditingFact(null)
        fetchFacts()
      }
    } catch (error) {
      console.error('Error updating fact:', error)
    }
  }

  const handleDeleteFact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this space fact?')) return

    try {
      const response = await fetch(`/api/admin/space-facts?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchFacts()
      }
    } catch (error) {
      console.error('Error deleting fact:', error)
    }
  }

  const toggleFactStatus = async (fact: SpaceFact) => {
    try {
      const response = await fetch('/api/admin/space-facts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fact,
          is_active: !fact.is_active
        })
      })

      if (response.ok) {
        fetchFacts()
      }
    } catch (error) {
      console.error('Error toggling fact status:', error)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/forum"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Forum
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  🌟 Space Facts Admin
                </h1>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                + Add New Fact
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Add/Edit Form Modal */}
          {(showAddForm || editingFact) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  {editingFact ? 'Edit Space Fact' : 'Add New Space Fact'}
                </h3>
                <form onSubmit={editingFact ? handleUpdateFact : handleAddFact} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fact
                    </label>
                    <textarea
                      value={editingFact ? editingFact.fact : newFact.fact}
                      onChange={(e) => editingFact 
                        ? setEditingFact({...editingFact, fact: e.target.value})
                        : setNewFact({...newFact, fact: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={editingFact ? editingFact.category : newFact.category}
                      onChange={(e) => editingFact 
                        ? setEditingFact({...editingFact, category: e.target.value})
                        : setNewFact({...newFact, category: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source (optional)
                    </label>
                    <input
                      type="text"
                      value={editingFact ? editingFact.source : newFact.source}
                      onChange={(e) => editingFact 
                        ? setEditingFact({...editingFact, source: e.target.value})
                        : setNewFact({...newFact, source: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., NASA, Hubble Space Telescope"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingFact(null)
                      }}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                      {editingFact ? 'Update' : 'Add'} Fact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Facts List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Space Facts ({facts.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {facts.map((fact) => (
                <div key={fact.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          fact.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {fact.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {fact.category}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-2">{fact.fact}</p>
                      {fact.source && (
                        <p className="text-sm text-gray-500">Source: {fact.source}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(fact.created_at).toLocaleDateString()}
                        {fact.updated_at !== fact.created_at && (
                          <span> • Updated: {new Date(fact.updated_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleFactStatus(fact)}
                        className={`px-3 py-1 text-sm rounded-md font-medium ${
                          fact.is_active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {fact.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setEditingFact(fact)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFact(fact.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 