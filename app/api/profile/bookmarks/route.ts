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
          category:categories(name, color, icon),
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
    const transformedBookmarks = bookmarks?.map(bookmark => {
      const post = Array.isArray(bookmark.post) ? bookmark.post[0] : bookmark.post;
      const author = Array.isArray(post?.author) ? post.author[0] : post?.author;
      const category = Array.isArray(post?.category) ? post.category[0] : post?.category;
      
      return {
        id: bookmark.id,
        title: post?.title || 'Unknown Post',
        excerpt: post?.excerpt || 'No excerpt available',
        created_at: bookmark.created_at,
        view_count: post?.view_count || 0,
        like_count: post?.like_count || 0,
        reply_count: post?.reply_count || 0,
        author_name: author?.username || 'Unknown User',
        category_name: category?.name || 'Unknown Category',
        category_color: category?.color || '#6B7280',
        category_icon: category?.icon || '📝'
      }
    }) || []

    return NextResponse.json({ bookmarks: transformedBookmarks })
  } catch (error) {
    console.error('Bookmarks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 