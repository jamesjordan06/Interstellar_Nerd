import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: postId } = await params

    const { data: replies, error } = await supabaseAdmin
      .from('replies')
      .select(`
        id,
        content,
        created_at,
        like_count,
        author:users!replies_author_id_fkey(username, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching replies:', error)
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 })
    }

    let likedReplyIds = new Set<string>()

    // Only check like status for authenticated users
    if (session?.user?.id && replies && replies.length > 0) {
      // Get all reply likes for this user
      const replyIds = replies.map(reply => reply.id)
      const { data: userLikes } = await supabaseAdmin
        .from('reply_likes')
        .select('reply_id')
        .eq('user_id', session.user.id)
        .in('reply_id', replyIds)

      likedReplyIds = new Set(userLikes?.map(like => like.reply_id) || [])
    }

    // Transform the data
    const transformedReplies = replies?.map(reply => ({
      id: reply.id,
      content: reply.content,
      created_at: reply.created_at,
      like_count: reply.like_count || 0,
      author_name: (reply.author as { username: string } | null)?.username || 'Unknown User',
      author_email: (reply.author as { email: string } | null)?.email || null
    })) || []

    return NextResponse.json({ replies: transformedReplies })
  } catch (error) {
    console.error('Replies GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params
    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 })
    }

    // Create the reply
    const { data: reply, error } = await supabaseAdmin
      .from('replies')
      .insert({
        content: content.trim(),
        author_id: session.user.id,
        post_id: postId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reply:', error)
      return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
    }

    // Update post reply count
    const { data: currentPost } = await supabaseAdmin
      .from('posts')
      .select('reply_count')
      .eq('id', postId)
      .single()
    
    if (currentPost) {
      await supabaseAdmin
        .from('posts')
        .update({ 
          reply_count: (currentPost.reply_count || 0) + 1,
          last_reply_at: new Date().toISOString()
        })
        .eq('id', postId)
    }

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    console.error('Replies POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 