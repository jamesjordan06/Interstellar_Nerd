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

    // Get post count
    const { count: postCount, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', session.user.id)
      .eq('is_hidden', false)

    if (postError) {
      console.error('Error fetching post count:', postError)
    }

    // Get reply count
    const { count: replyCount, error: replyError } = await supabaseAdmin
      .from('replies')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', session.user.id)
      .eq('is_hidden', false)

    if (replyError) {
      console.error('Error fetching reply count:', replyError)
    }

    const stats = {
      post_count: postCount || 0,
      reply_count: replyCount || 0
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 