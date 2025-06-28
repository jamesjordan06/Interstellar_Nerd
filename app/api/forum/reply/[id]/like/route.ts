import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: replyId } = await params

    // Check if user already liked this reply
    const { data: existingLike } = await supabaseAdmin
      .from('reply_likes')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', session.user.id)
      .single()

    let isLiked = false
    let likeCountChange = 0

    if (existingLike) {
      // Unlike: Remove the like
      await supabaseAdmin
        .from('reply_likes')
        .delete()
        .eq('reply_id', replyId)
        .eq('user_id', session.user.id)
      
      likeCountChange = -1
      isLiked = false
    } else {
      // Like: Add the like
      await supabaseAdmin
        .from('reply_likes')
        .insert({
          reply_id: replyId,
          user_id: session.user.id
        })
      
      likeCountChange = 1
      isLiked = true
    }

    // Update reply like count
    const { data: currentReply } = await supabaseAdmin
      .from('replies')
      .select('like_count')
      .eq('id', replyId)
      .single()
    
    if (currentReply) {
      const newLikeCount = Math.max(0, (currentReply.like_count || 0) + likeCountChange)
      
      await supabaseAdmin
        .from('replies')
        .update({ like_count: newLikeCount })
        .eq('id', replyId)
    }

    return NextResponse.json({ 
      isLiked,
      likeCount: Math.max(0, (currentReply?.like_count || 0) + likeCountChange)
    })

  } catch (error) {
    console.error('Like reply API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 