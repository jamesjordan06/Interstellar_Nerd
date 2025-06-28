import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username } = await request.json()

    // Validate username
    if (!username || username.trim().length === 0) {
      // Allow clearing username
      const { error } = await supabaseAdmin
        .from('users')
        .update({ 
          username: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (error) {
        console.error('Error clearing username:', error)
        return NextResponse.json({ error: 'Failed to clear username' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Username cleared successfully' })
    }

    const cleanUsername = username.trim().toLowerCase()

    // Validate username format
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return NextResponse.json({ 
        error: 'Username must be between 3 and 30 characters' 
      }, { status: 400 })
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(cleanUsername)) {
      return NextResponse.json({ 
        error: 'Username can only contain letters, numbers, dashes, and underscores' 
      }, { status: 400 })
    }

    // Reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'mod', 'moderator', 'support', 'help',
      'api', 'www', 'mail', 'ftp', 'localhost', 'root', 'test',
      'null', 'undefined', 'delete', 'remove', 'system', 'official',
      'bot', 'user', 'account', 'profile', 'settings', 'config'
    ]

    if (reservedUsernames.includes(cleanUsername)) {
      return NextResponse.json({ 
        error: 'This username is reserved and cannot be used' 
      }, { status: 400 })
    }

    // Check if username is already taken
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', cleanUsername)
      .neq('id', session.user.id)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Username is already taken' 
      }, { status: 409 })
    }

    // Update username
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ 
        username: cleanUsername,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select('id, username')
      .single()

    if (error) {
      console.error('Error updating username:', error)
      return NextResponse.json({ error: 'Failed to update username' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Username updated successfully',
      username: updatedUser.username 
    })
  } catch (error) {
    console.error('Username update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 