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

    const { id: postId } = await params

    // Check if user already liked this post
    const { data: existingLike } = await supabaseAdmin
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .single()

    let isLiked = false
    let likeCountChange = 0

    if (existingLike) {
      // Unlike: Remove the like
      await supabaseAdmin
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
      
      likeCountChange = -1
      isLiked = false
    } else {
      // Like: Add the like
      await supabaseAdmin
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: session.user.id
        })
      
      likeCountChange = 1
      isLiked = true
    }

    // Update post like count
    const { data: currentPost } = await supabaseAdmin
      .from('posts')
      .select('like_count')
      .eq('id', postId)
      .single()
    
    if (currentPost) {
      const newLikeCount = Math.max(0, (currentPost.like_count || 0) + likeCountChange)
      
      await supabaseAdmin
        .from('posts')
        .update({ like_count: newLikeCount })
        .eq('id', postId)
    }

    return NextResponse.json({ 
      isLiked,
      likeCount: Math.max(0, (currentPost?.like_count || 0) + likeCountChange)
    })

  } catch (error) {
    console.error('Like post API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 