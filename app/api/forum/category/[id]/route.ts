import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params

    // Fetch category info
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('name, description, color, icon')
      .eq('id', categoryId)
      .eq('is_active', true)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Fetch posts in this category
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        title,
        excerpt,
        created_at,
        view_count,
        like_count,
        reply_count,
        author:users!posts_author_id_fkey(username)
      `)
      .eq('category_id', categoryId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('Error fetching category posts:', postsError)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
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
      author_name: (post.author as any)?.username || 'Unknown User',
      category_name: category.name,
      category_color: category.color
    })) || []

    return NextResponse.json({
      category,
      posts: transformedPosts
    })
  } catch (error) {
    console.error('Category API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 