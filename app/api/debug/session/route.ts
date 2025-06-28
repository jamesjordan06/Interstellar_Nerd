import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    // Get user details from database
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    // Get linked accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('provider, provider_account_id, created_at')
      .eq('user_id', session.user.id)

    return NextResponse.json({
      session: {
        user: session.user,
      },
      database: {
        user: dbUser,
        userError: userError?.message,
        accounts: accounts || [],
        accountsError: accountsError?.message
      },
      debug: {
        sessionUserId: session.user.id,
        sessionEmail: session.user.email,
        dbUserId: dbUser?.id,
        dbEmail: dbUser?.email,
        accountCount: accounts?.length || 0,
        linkedProviders: accounts?.map(acc => acc.provider) || []
      }
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 