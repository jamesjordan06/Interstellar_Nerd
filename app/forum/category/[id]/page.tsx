'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Post {
  id: string
  title: string
  excerpt: string
  author_name: string
  created_at: string
  view_count: number
  like_count: number
  reply_count: number
  category_name: string
  category_color: string
}

interface Category {
  name: string
  description: string
  color: string
  icon: string
}

export default function CategoryPage() {
  const { data: session } = useSession()
  const params = useParams()
  const categoryId = params.id as string
  
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (categoryId) {
      fetchCategoryPosts()
    }
  }, [categoryId])

  const fetchCategoryPosts = async () => {
    try {
      const response = await fetch(`/api/forum/category/${categoryId}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setCategory(data.category)
      }
    } catch (error) {
      console.error('Error fetching category posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
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
              {category && (
                <div className="flex items-center space-x-2">
                  <span 
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></span>
                  <span className="text-xl">{category.icon}</span>
                  <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
                </div>
              )}
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
        {category && (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <p className="text-sm text-gray-500">{posts.length} posts in this category</p>
              </div>
              {session?.user ? (
                <Link
                  href="/forum/create-post"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  + New Post
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Sign In to Post
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm">
              <Link href={`/forum/post/${post.id}`} className="block p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {post.excerpt || 'No excerpt available'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>By {post.author_name}</span>
                      <span>•</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500 ml-4">
                    <div className="flex items-center space-x-3">
                      <span>👁️ {post.view_count}</span>
                      <span>👍 {post.like_count}</span>
                      <span>💬 {post.reply_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
              <p className="text-gray-600 mb-4">
                Be the first to start a discussion in this category!
              </p>
              {session?.user ? (
                <Link
                  href="/forum/create-post"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Create First Post
                </Link>
              ) : (
                <div className="space-x-2">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Sign In to Post
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 