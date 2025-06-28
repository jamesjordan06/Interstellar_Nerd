import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase()

    // Validate username format
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return NextResponse.json({ 
        available: false,
        reason: 'Username must be between 3 and 30 characters'
      })
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(cleanUsername)) {
      return NextResponse.json({ 
        available: false,
        reason: 'Username can only contain letters, numbers, dashes, and underscores'
      })
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
        available: false,
        reason: 'This username is reserved'
      })
    }

    // Check if username is already taken
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', cleanUsername)
      .neq('id', session.user.id)
      .single()

    const available = !existingUser

    return NextResponse.json({ 
      available,
      reason: available ? null : 'Username is already taken'
    })
  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 