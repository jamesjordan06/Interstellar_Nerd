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

    // Check if user already bookmarked this post
    const { data: existingBookmark } = await supabaseAdmin
      .from('post_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .single()

    let isBookmarked = false

    if (existingBookmark) {
      // Remove bookmark
      await supabaseAdmin
        .from('post_bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
      
      isBookmarked = false
    } else {
      // Add bookmark
      await supabaseAdmin
        .from('post_bookmarks')
        .insert({
          post_id: postId,
          user_id: session.user.id
        })
      
      isBookmarked = true
    }

    return NextResponse.json({ isBookmarked })

  } catch (error) {
    console.error('Bookmark post API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 