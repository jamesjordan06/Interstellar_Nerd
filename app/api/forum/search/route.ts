import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const categoryId = searchParams.get('category')
    const sortBy = searchParams.get('sort') || 'relevance'

    if (!query?.trim()) {
      return NextResponse.json({ posts: [] })
    }

    let supabaseQuery = supabaseAdmin
      .from('posts')
      .select(`
        id,
        title,
        excerpt,
        created_at,
        view_count,
        like_count,
        reply_count,
        author:users!posts_author_id_fkey(username),
        category:categories(name, color, icon)
      `)
      .eq('is_hidden', false)

    // Add search filter
    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    }

    // Add category filter
    if (categoryId) {
      supabaseQuery = supabaseQuery.eq('category_id', categoryId)
    }

    // Add sorting
    switch (sortBy) {
      case 'newest':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
        break
      case 'oldest':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: true })
        break
      case 'most_views':
        supabaseQuery = supabaseQuery.order('view_count', { ascending: false })
        break
      case 'most_replies':
        supabaseQuery = supabaseQuery.order('reply_count', { ascending: false })
        break
      case 'relevance':
      default:
        // For relevance, we'll just use created_at desc as a simple implementation
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
        break
    }

    const { data: posts, error } = await supabaseQuery.limit(50)

    if (error) {
      console.error('Error searching posts:', error)
      return NextResponse.json({ error: 'Failed to search posts' }, { status: 500 })
    }

    // Transform the data
    const transformedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      created_at: post.created_at,
      view_count: post.view_count || 0,
      like_count: post.like_count || 0,
      reply_count: post.reply_count || 0,
      author_name: Array.isArray(post.author) ? post.author[0]?.username : (post.author as any)?.username || 'Unknown User',
      category_name: Array.isArray(post.category) ? post.category[0]?.name : (post.category as any)?.name || 'Unknown Category',
      category_color: Array.isArray(post.category) ? post.category[0]?.color : (post.category as any)?.color || '#6B7280',
      category_icon: Array.isArray(post.category) ? post.category[0]?.icon : (post.category as any)?.icon || '📝'
    })) || []

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 