import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// In-memory cache to prevent duplicate view increments
const viewIncrementCache = new Map<string, number>()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: postId } = await params
    
    // Allow public viewing, but only track views for authenticated users
    if (session?.user?.id) {
      const cacheKey = `${postId}-${session.user.id}`
      const now = Date.now()
      
      // Only increment view count if this user hasn't viewed this post in the last 5 minutes
      const lastViewTime = viewIncrementCache.get(cacheKey)
      const shouldIncrementView = !lastViewTime || (now - lastViewTime) > 5 * 60 * 1000 // 5 minutes

      if (shouldIncrementView) {
        // Increment view count
        const { data: currentPost } = await supabaseAdmin
          .from('posts')
          .select('view_count')
          .eq('id', postId)
          .single()
        
        if (currentPost) {
          await supabaseAdmin
            .from('posts')
            .update({ view_count: (currentPost.view_count || 0) + 1 })
            .eq('id', postId)
          
          // Cache this view increment
          viewIncrementCache.set(cacheKey, now)
          
          // Clean up old cache entries (older than 1 hour)
          for (const [key, time] of viewIncrementCache.entries()) {
            if (now - time > 60 * 60 * 1000) { // 1 hour
              viewIncrementCache.delete(key)
            }
          }
        }
      }
    }

    // Fetch post with author and category info
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        view_count,
        like_count,
        reply_count,
        author:users!posts_author_id_fkey(username, avatar_url),
        category:categories(name, color)
      `)
      .eq('id', postId)
      .eq('is_hidden', false)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    let isLiked = false
    let isBookmarked = false

    // Only check like/bookmark status for authenticated users
    if (session?.user?.id) {
      // Check if user has liked this post
      const { data: likeData } = await supabaseAdmin
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .single()

      // Check if user has bookmarked this post
      const { data: bookmarkData } = await supabaseAdmin
        .from('post_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .single()

      isLiked = !!likeData
      isBookmarked = !!bookmarkData
    }

    // Transform the data
    const transformedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      created_at: post.created_at,
      view_count: post.view_count || 0,
      like_count: post.like_count || 0,
      reply_count: post.reply_count || 0,
      author_name: (post.author as { username: string } | null)?.username || 'Unknown User',
      author_image: (post.author as any)?.avatar_url,
      category_name: (post.category as { name: string } | null)?.name || 'Unknown Category',
      category_color: (post.category as { color: string } | null)?.color || '#6B7280',
      category_icon: (post.category as { icon: string } | null)?.icon || '📝',
      is_liked: isLiked,
      is_bookmarked: isBookmarked
    }

    return NextResponse.json({ post: transformedPost })
  } catch (error) {
    console.error('Post API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 