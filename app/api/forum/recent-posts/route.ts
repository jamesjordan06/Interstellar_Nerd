import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        view_count,
        like_count,
        reply_count,
        author:users!posts_author_id_fkey(username),
        category:categories(name, color)
      `)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching recent posts:', error)
      return NextResponse.json({ error: 'Failed to fetch recent posts' }, { status: 500 })
    }

    // Transform the data for easier use in the frontend
    const transformedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      created_at: post.created_at,
      view_count: post.view_count || 0,
      like_count: post.like_count || 0,
      reply_count: post.reply_count || 0,
      author_name: (post.author as { username: string } | null)?.username || 'Unknown User',
      category_name: (post.category as { name: string } | null)?.name || 'Unknown Category',
      category_color: (post.category as { color: string } | null)?.color || '#6B7280',
      category_icon: (post.category as { icon: string } | null)?.icon || '📝'
    })) || []

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error('Recent posts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 