'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Post {
  id: string
  title: string
  excerpt: string
  author_name: string
  category_name: string
  category_color: string
  created_at: string
  view_count: number
  like_count: number
  reply_count: number
}

interface Category {
  id: string
  name: string
  color: string
}

export default function SearchPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance')
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    fetchCategories()
    
    // Auto-search if URL has query parameters
    const urlSearchTerm = searchParams.get('q')
    if (urlSearchTerm) {
      setHasSearched(true)
      performSearch(urlSearchTerm, searchParams.get('category') || '', searchParams.get('sort') || 'relevance')
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const performSearch = async (term: string, category: string, sort: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (term) params.append('q', term)
      if (category) params.append('category', category)
      if (sort) params.append('sort', sort)
      
      const response = await fetch(`/api/forum/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error searching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSearched(true)
    performSearch(searchTerm, selectedCategory, sortBy)
    
    // Update URL
    const params = new URLSearchParams()
    if (searchTerm) params.append('q', searchTerm)
    if (selectedCategory) params.append('category', selectedCategory)
    if (sortBy !== 'relevance') params.append('sort', sortBy)
    
    const newUrl = params.toString() ? `/forum/search?${params}` : '/forum/search'
    window.history.pushState({}, '', newUrl)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string | null, maxLength: number = 200) => {
    if (!content) return 'No content available'
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text
    
    const regex = new RegExp(`(${term})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/forum"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Forum
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Search Posts</h1>
            </div>
            
            {!session?.user && (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Terms
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts and discussions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_views">Most Views</option>
                  <option value="most_replies">Most Replies</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-lg shadow-sm">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching posts...</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {posts.length > 0 ? (
                      `Found ${posts.length} result${posts.length !== 1 ? 's' : ''}`
                    ) : (
                      'No results found'
                    )}
                    {searchTerm && (
                      <span className="text-gray-600 font-normal">
                        {' '}for "{searchTerm}"
                      </span>
                    )}
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/forum/post/${post.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: post.category_color }}
                          ></span>
                          <span className="text-sm text-gray-500">{post.category_name}</span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                          {highlightSearchTerm(post.title, searchTerm)}
                        </h3>
                        
                        <p className="text-sm text-gray-600">
                          {highlightSearchTerm(truncateContent(post.excerpt), searchTerm)}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>By {post.author_name}</span>
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span>👁️ {post.view_count}</span>
                            <span>👍 {post.like_count}</span>
                            <span>💬 {post.reply_count}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {posts.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <div className="text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your search terms or filters.
                      </p>
                      <Link
                        href="/forum"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Browse all posts
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Welcome message for first visit */}
        {!hasSearched && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Forum Posts</h2>
            <p className="text-gray-600 mb-6">
              Find discussions, answers, and insights from the space community.
            </p>
            <div className="text-sm text-gray-500">
              <p>• Search by keywords, topics, or specific terms</p>
              <p>• Filter by category to narrow down results</p>
              <p>• Sort by relevance, date, or popularity</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 