'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Post {
  id: string
  title: string
  content: string
  author_name: string
  author_image?: string
  category_name: string
  category_color: string
  created_at: string
  view_count: number
  like_count: number
  reply_count: number
  is_liked: boolean
  is_bookmarked: boolean
}

interface Reply {
  id: string
  content: string
  author_name: string
  author_image?: string
  created_at: string
  like_count: number
  is_liked: boolean
}

export default function PostPage() {
  const { data: session } = useSession()
  const params = useParams()
  const postId = params.id as string
  
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newReply, setNewReply] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchReplies()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/forum/post/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setRetryCount(0) // Reset retry count on success
      } else if (response.status === 404 && retryCount < 3) {
        // Retry up to 3 times for 404 errors (post might be still being created)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchPost()
        }, 1000)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      if (retryCount < 3) {
        // Retry on network errors too
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchPost()
        }, 1000)
      }
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/forum/post/${postId}/replies`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data.replies)
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikePost = async () => {
    if (!session?.user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/auth/signin'
      return
    }
    
    if (!post) return
    
    try {
      const response = await fetch(`/api/forum/post/${postId}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPost(prev => prev ? {
          ...prev,
          is_liked: data.isLiked,
          like_count: data.likeCount
        } : null)
      } else if (response.status === 401) {
        window.location.href = '/auth/signin'
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleBookmarkPost = async () => {
    if (!session?.user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/auth/signin'
      return
    }
    
    if (!post) return
    
    try {
      const response = await fetch(`/api/forum/post/${postId}/bookmark`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPost(prev => prev ? {
          ...prev,
          is_bookmarked: data.isBookmarked
        } : null)
      } else if (response.status === 401) {
        window.location.href = '/auth/signin'
      }
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }

  const handleLikeReply = async (replyId: string) => {
    if (!session?.user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/auth/signin'
      return
    }
    
    try {
      const response = await fetch(`/api/forum/reply/${replyId}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, is_liked: data.isLiked, like_count: data.likeCount }
            : reply
        ))
      } else if (response.status === 401) {
        window.location.href = '/auth/signin'
      }
    } catch (error) {
      console.error('Error liking reply:', error)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      window.location.href = '/auth/signin'
      return
    }
    
    if (!newReply.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/forum/post/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newReply }),
      })

      if (response.ok) {
        setNewReply('')
        // Only fetch replies to update the list - don't fetch post to avoid count doubling
        await fetchReplies()
        // Update post reply count manually
        setPost(prev => prev ? {
          ...prev,
          reply_count: prev.reply_count + 1
        } : null)
      } else if (response.status === 401) {
        window.location.href = '/auth/signin'
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-2">{line}</p>
    ))
  }

  if (isLoading || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {!post && !isLoading && retryCount >= 3 ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-4">The post you're looking for doesn't exist or may have been removed.</p>
            <Link
              href="/forum"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Forum
            </Link>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/forum"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Forum
            </Link>
            
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
        
        {/* Post */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            {/* Post Header */}
            <div className="flex items-center space-x-2 mb-4">
              <span 
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: post.category_color }}
              ></span>
              <span className="text-sm text-gray-500">{post.category_name}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Author and Date */}
            <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                {post.author_image && (
                  <Image
                    src={post.author_image}
                    alt={post.author_name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span>By {post.author_name}</span>
              </div>
              <span>•</span>
              <span>{formatDate(post.created_at)}</span>
              <span>•</span>
              <span>{post.view_count} views</span>
            </div>

            {/* Post Content */}
            <div className="prose max-w-none mb-6 text-gray-700">
              {formatContent(post.content)}
            </div>

            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
              <button 
                onClick={handleLikePost}
                className={`flex items-center space-x-2 transition-colors ${
                  session?.user 
                    ? (post.is_liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600')
                    : 'text-gray-400 hover:text-blue-600'
                }`}
                title={!session?.user ? 'Sign in to like posts' : ''}
              >
                <span>{post.is_liked ? '👍' : '👍'}</span>
                <span>{post.like_count}</span>
              </button>
              <button 
                onClick={handleBookmarkPost}
                className={`flex items-center space-x-2 transition-colors ${
                  session?.user 
                    ? (post.is_bookmarked ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600')
                    : 'text-gray-400 hover:text-yellow-600'
                }`}
                title={!session?.user ? 'Sign in to bookmark posts' : ''}
              >
                <span>{post.is_bookmarked ? '🔖' : '🔖'}</span>
                <span>{post.is_bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-500">
                <span>💬</span>
                <span>{post.reply_count} replies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Post a Reply
            </h3>
            {session?.user ? (
              <form onSubmit={handleSubmitReply}>
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={!newReply.trim() || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Join the Discussion</h4>
                <p className="text-gray-600 mb-4">Sign in to post replies and engage with the community.</p>
                <div className="space-x-2">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4">
          {replies.map((reply, index) => (
            <div key={reply.id} className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                {/* Reply Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {reply.author_image && (
                      <Image
                        src={reply.author_image}
                        alt={reply.author_name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{reply.author_name}</p>
                      <p className="text-sm text-gray-500">{formatDate(reply.created_at)}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">#{index + 1}</span>
                </div>

                {/* Reply Content */}
                <div className="text-gray-700 mb-4">
                  {formatContent(reply.content)}
                </div>

                {/* Reply Actions */}
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLikeReply(reply.id)}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      session?.user 
                        ? (reply.is_liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600')
                        : 'text-gray-400 hover:text-blue-600'
                    }`}
                    title={!session?.user ? 'Sign in to like replies' : ''}
                  >
                    <span>👍</span>
                    <span>{reply.like_count}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {replies.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
              No replies yet. Be the first to reply!
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 