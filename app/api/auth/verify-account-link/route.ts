import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, provider, password } = await request.json()

    if (!email || !provider || !password) {
      return NextResponse.json(
        { error: 'Email, provider, and password are required' },
        { status: 400 }
      )
    }

    // Get user and verify password
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, password_hash')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Get pending account link
    const { data: pendingLink, error: pendingError } = await supabaseAdmin
      .from('pending_account_links')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('provider_email', email)
      .gte('expires_at_pending', new Date().toISOString())
      .is('verified_at', null)
      .single()

    if (pendingError || !pendingLink) {
      return NextResponse.json(
        { error: 'Pending account link not found or expired. Please try signing in again.' },
        { status: 404 }
      )
    }

    // Check if account is already linked
    const { data: existingAccount } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('provider_account_id', pendingLink.provider_account_id)
      .single()

    if (existingAccount) {
      // Clean up pending link
      await supabaseAdmin
        .from('pending_account_links')
        .delete()
        .eq('id', pendingLink.id)

      return NextResponse.json(
        { error: 'Account is already linked' },
        { status: 409 }
      )
    }

    // Create the actual account link
    const { error: linkError } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id: user.id,
        provider: pendingLink.provider,
        provider_account_id: pendingLink.provider_account_id,
        access_token: pendingLink.access_token,
        refresh_token: pendingLink.refresh_token,
        expires_at: pendingLink.expires_at,
        token_type: pendingLink.token_type,
        scope: pendingLink.scope,
        id_token: pendingLink.id_token,
        created_at: new Date().toISOString()
      })

    if (linkError) {
      console.error('Error creating account link:', linkError)
      return NextResponse.json(
        { error: 'Failed to link account' },
        { status: 500 }
      )
    }

    // Mark pending link as verified and clean up
    await supabaseAdmin
      .from('pending_account_links')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', pendingLink.id)

    // Clean up old/expired pending links
    await supabaseAdmin
      .from('pending_account_links')
      .delete()
      .lt('expires_at_pending', new Date().toISOString())

    return NextResponse.json({
      message: 'Account linked successfully',
      provider: provider
    })
  } catch (error) {
    console.error('Verify account link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 