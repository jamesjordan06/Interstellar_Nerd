'use client'

import { useSession } from 'next-auth/react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface BookmarkedPost {
  bookmark_id: string
  bookmarked_at: string
  post: {
    id: string
    title: string
    excerpt: string
    created_at: string
    view_count: number
    like_count: number
    reply_count: number
    category_name: string
    category_color: string
    author_name: string
  }
}

export default function BookmarksPage() {
  const { data: session } = useSession()
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchBookmarks()
    }
  }, [session])

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/profile/bookmarks')
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data.bookmarks)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/forum/post/${postId}/bookmark`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Remove from local state
        setBookmarks(prev => prev.filter(bookmark => bookmark.post.id !== postId))
      }
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Profile
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
              </div>
              <Link
                href="/forum"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Forum
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Bookmarks Yet</h2>
              <p className="text-gray-600 mb-6">
                Start bookmarking posts to save them for later reading.
              </p>
              <Link
                href="/forum"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Browse Forum
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {bookmarks.length} Saved Post{bookmarks.length !== 1 ? 's' : ''}
                </h2>
                <p className="text-gray-600">
                  Your bookmarked posts are saved here for easy access.
                </p>
              </div>

              {/* Bookmarked Posts */}
              <div className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.bookmark_id} className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: bookmark.post.category_color }}
                          ></span>
                          <span className="text-sm text-gray-500">{bookmark.post.category_name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveBookmark(bookmark.post.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Post Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        <Link
                          href={`/forum/post/${bookmark.post.id}`}
                          className="hover:text-blue-600"
                        >
                          {bookmark.post.title}
                        </Link>
                      </h3>

                      {/* Post Excerpt */}
                      <p className="text-gray-600 mb-4">
                        {truncateText(bookmark.post.excerpt || '', 200)}
                      </p>

                      {/* Post Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>By {bookmark.post.author_name}</span>
                          <span>•</span>
                          <span>{formatDate(bookmark.post.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>👁️ {bookmark.post.view_count}</span>
                          <span>👍 {bookmark.post.like_count}</span>
                          <span>💬 {bookmark.post.reply_count}</span>
                        </div>
                      </div>

                      {/* Bookmark Date */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400">
                          Bookmarked on {formatDate(bookmark.bookmarked_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
} 