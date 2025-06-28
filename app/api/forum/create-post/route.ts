import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, slug, content, category_id } = await request.json()

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!category_id) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    if (!slug?.trim()) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Verify category exists
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Create excerpt from content (first 200 characters)
    const excerpt = content.trim().substring(0, 200) + (content.length > 200 ? '...' : '')

    // Create the post
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        excerpt,
        author_id: session.user.id,
        category_id,
        view_count: 0,
        reply_count: 0,
        like_count: 0,
        is_pinned: false,
        is_locked: false,
        is_hidden: false
      })
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        view_count,
        like_count,
        reply_count,
        created_at,
        author:users!posts_author_id_fkey(username),
        category:categories(name, color, icon)
      `)
      .single()

    if (error) {
      console.error('Error creating post:', error)
      
      // Handle duplicate slug error
      if (error.code === '23505' && error.message.includes('posts_slug_key')) {
        return NextResponse.json({ 
          error: 'A post with this title already exists. Please use a different title.' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    // Update category post count (don't fail the request if this fails)
    try {
      const { data: currentCategory } = await supabaseAdmin
        .from('categories')
        .select('post_count')
        .eq('id', category_id)
        .single()
      
      if (currentCategory) {
        await supabaseAdmin
          .from('categories')
          .update({ 
            post_count: (currentCategory.post_count || 0) + 1,
            last_post_at: new Date().toISOString()
          })
          .eq('id', category_id)
      }
    } catch (updateError) {
      console.error('Failed to update category post count:', updateError)
    }

    // Transform the data to match expected format
    const transformedPost = {
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
    }

    return NextResponse.json({ 
      post: transformedPost,
      message: 'Post created successfully!'
    }, { status: 201 })

  } catch (error) {
    console.error('Create post API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 