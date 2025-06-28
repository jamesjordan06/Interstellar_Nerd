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

    // Get user's posts count
    const { count: postsCount } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', session.user.id)
      .eq('is_hidden', false)

    // Get user's replies count
    const { count: repliesCount } = await supabaseAdmin
      .from('replies')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', session.user.id)
      .eq('is_hidden', false)

    // Get user's recent posts (last 5)
    const { data: recentPosts } = await supabaseAdmin
      .from('posts')
      .select('id, title, created_at')
      .eq('author_id', session.user.id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get user's join date
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('created_at')
      .eq('id', session.user.id)
      .single()

    const activity = {
      posts_count: postsCount || 0,
      replies_count: repliesCount || 0,
      recent_posts: recentPosts || [],
      join_date: userData?.created_at || new Date().toISOString()
    }

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('User activity API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 