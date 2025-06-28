'use client'

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  description: string
  color: string
  icon: string
  post_count: number
  last_post_at: string | null
  last_post_title?: string
  last_post_author?: string
}

interface RecentPost {
  id: string
  title: string
  content: string
  author_name: string
  category_name: string
  category_color: string
  created_at: string
  view_count: number
  like_count: number
  reply_count: number
}

interface UserActivity {
  posts_count: number
  replies_count: number
  recent_posts: Array<{
    id: string
    title: string
    created_at: string
  }>
  join_date: string
}

interface SpaceFact {
  fact: string
  category: string
  source: string
  id: string
}

export default function ForumPage() {
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [dailySpaceFact, setDailySpaceFact] = useState<SpaceFact | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchForumData()
    if (session?.user) {
      fetchUserActivity()
    }
    fetchDailySpaceFact()
  }, [session])

  const fetchForumData = async () => {
    try {
      const [categoriesRes, postsRes] = await Promise.all([
        fetch('/api/forum/categories'),
        fetch('/api/forum/recent-posts')
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories)
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setRecentPosts(postsData.posts)
      }
    } catch (error) {
      console.error('Error fetching forum data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserActivity = async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch('/api/forum/user-activity')
      if (response.ok) {
        const data = await response.json()
        setUserActivity(data.activity)
      }
    } catch (error) {
      console.error('Error fetching user activity:', error)
    }
  }

  const fetchDailySpaceFact = async () => {
    try {
      const response = await fetch('/api/space-facts?mode=daily')
      if (response.ok) {
        const data = await response.json()
        setDailySpaceFact(data)
      }
    } catch (error) {
      console.error('Error fetching space fact:', error)
      // Fallback fact if API fails
      setDailySpaceFact({
        fact: "🌌 The universe is full of wonders waiting to be discovered!",
        category: "general",
        source: "Default fact",
        id: "fallback"
      })
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 Interstellar Nerd Forum
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {session?.user ? (
                // Authenticated user menu
                <>
                  <div className="flex items-center space-x-3">
                    {session.user.image && (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {session.user.name}
                      </p>
                      <p className="text-gray-500">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/profile"
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                // Unauthenticated user menu
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
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Categories Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                  {session?.user ? (
                    <Link
                      href="/forum/create-post"
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                    >
                      + New Post
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                    >
                      Sign In to Post
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/forum/category/${category.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="inline-block w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          ></span>
                          <span className="text-xl">{category.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        <p className="font-medium">{category.post_count} posts</p>
                        {category.last_post_at && (
                          <p className="text-xs">
                            Last: {formatDate(category.last_post_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Posts Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentPosts.map((post) => (
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
                      
                      <h3 className="text-base font-medium text-gray-900 hover:text-blue-600">
                        {post.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600">
                        {truncateContent(post.content)}
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Space Fact of the Day */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">🌌 Space Fact of the Day</h3>
              {dailySpaceFact ? (
                <div>
                  <p className="text-sm leading-relaxed mb-2">
                    {dailySpaceFact.fact}
                  </p>
                  <p className="text-xs opacity-75">
                    Updates daily
                  </p>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                </div>
              )}
            </div>

            {/* User Activity or Sign Up Prompt */}
            {session?.user && userActivity ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Posts</span>
                    <span className="font-medium">{userActivity.posts_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Replies</span>
                    <span className="font-medium">{userActivity.replies_count}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Member since {formatJoinDate(userActivity.join_date)}
                    </p>
                  </div>
                  
                  {userActivity.recent_posts.length > 0 && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Posts</h4>
                      <div className="space-y-1">
                        {userActivity.recent_posts.slice(0, 3).map((post) => (
                          <Link
                            key={post.id}
                            href={`/forum/post/${post.id}`}
                            className="block text-xs text-blue-600 hover:text-blue-800 truncate"
                          >
                            {post.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : !session?.user ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Community!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sign up to post, reply, bookmark, and interact with fellow space enthusiasts.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/auth/signup"
                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="block w-full text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 font-medium text-sm"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Quick Actions for authenticated users */}
            {session?.user && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/forum/search"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    🔍 Search Posts
                  </Link>
                  <Link
                    href="/profile/bookmarks"
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    🔖 My Bookmarks
                  </Link>
                  <Link
                    href="/profile"
                    className="block w-full text-left px-4 py-2 text-sm text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                  >
                    👤 View Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 