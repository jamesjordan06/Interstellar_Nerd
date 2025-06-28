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
      id: bookmark.id,
      title: (bookmark.post as { title: string } | null)?.title || 'Unknown Post',
      excerpt: (bookmark.post as { excerpt: string } | null)?.excerpt || 'No excerpt available',
      created_at: bookmark.created_at,
      view_count: (bookmark.post as { view_count: number } | null)?.view_count || 0,
      like_count: (bookmark.post as { like_count: number } | null)?.like_count || 0,
      reply_count: (bookmark.post as { reply_count: number } | null)?.reply_count || 0,
      author_name: (bookmark.post as { author?: { username: string } } | null)?.author?.username || 'Unknown User',
      category_name: (bookmark.post as { category?: { name: string } } | null)?.category?.name || 'Unknown Category',
      category_color: (bookmark.post as { category?: { color: string } } | null)?.category?.color || '#6B7280',
      category_icon: (bookmark.post as { category?: { icon: string } } | null)?.category?.icon || '📝'
    })) || []

    return NextResponse.json({ bookmarks: transformedBookmarks })
  } catch (error) {
    console.error('Bookmarks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 