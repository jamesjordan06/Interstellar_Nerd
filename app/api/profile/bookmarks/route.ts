import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's bookmarked posts with post details
    const { data: bookmarks, error } = await supabaseAdmin
      .from('post_bookmarks')
      .select(`
        id,
        created_at,
        post:posts(
          id,
          title,
          excerpt,
          created_at,
          view_count,
          like_count,
          reply_count,
          category:categories(name, color),
          author:users!posts_author_id_fkey(username)
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
    }

    // Transform the data
    const transformedBookmarks = bookmarks?.map(bookmark => ({
      bookmark_id: bookmark.id,
      bookmarked_at: bookmark.created_at,
      post: {
        id: (bookmark.post as any)?.id,
        title: (bookmark.post as any)?.title,
        excerpt: (bookmark.post as any)?.excerpt,
        created_at: (bookmark.post as any)?.created_at,
        view_count: (bookmark.post as any)?.view_count || 0,
        like_count: (bookmark.post as any)?.like_count || 0,
        reply_count: (bookmark.post as any)?.reply_count || 0,
        category_name: (bookmark.post as any)?.category?.name || 'General',
        category_color: (bookmark.post as any)?.category?.color || '#6B7280',
        author_name: (bookmark.post as any)?.author?.username || 'Unknown User'
      }
    })).filter(bookmark => bookmark.post.id) || [] // Filter out any bookmarks with deleted posts

    return NextResponse.json({ bookmarks: transformedBookmarks })
  } catch (error) {
    console.error('Bookmarks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 