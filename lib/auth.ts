import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Helper function to convert Unix timestamp to PostgreSQL timestamp
function convertUnixToTimestamp(unixTimestamp?: number | null): string | null {
  if (!unixTimestamp) return null
  return new Date(unixTimestamp * 1000).toISOString()
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if user exists
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            throw new Error('No user found with this email address')
          }

          // Check if user signed up with OAuth but has no password
          if (!user.password_hash) {
            // Check if they have OAuth accounts
            const { data: oauthAccounts } = await supabaseAdmin
              .from('accounts')
              .select('provider')
              .eq('user_id', user.id)

            if (oauthAccounts && oauthAccounts.length > 0) {
              const providers = oauthAccounts.map(acc => acc.provider).join(', ')
              throw new Error(`OAUTH_USER:${providers}`)
            } else {
              throw new Error('PASSWORD_NOT_SET')
            }
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar_url
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, _account, profile, email, credentials }) {
      if (_account?.provider === 'google') {
        try {
          // Check if a user with this email already exists
          const { data: existingUser, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          const googleProfile = profile as any // Google profile with picture

          if (existingUser) {
            // Check if this OAuth account is already linked
            const { data: existingAccount } = await supabaseAdmin
              .from('accounts')
              .select('*')
              .eq('user_id', existingUser.id)
              .eq('provider', _account.provider)
              .eq('provider_account_id', _account.providerAccountId)
              .single()

            if (!existingAccount) {
              // SECURITY CHECK: If user has a password, require verification before linking OAuth
              if (existingUser.password_hash) {
                console.log('Security: Attempting to link OAuth to password-protected account')
                
                // Create a pending account link instead of immediate linking
                const { error: pendingError } = await supabaseAdmin
                  .from('pending_account_links')
                  .upsert({
                    user_id: existingUser.id,
                    provider: _account.provider,
                    provider_account_id: _account.providerAccountId,
                    provider_email: user.email,
                    access_token: _account.access_token,
                    refresh_token: _account.refresh_token,
                    expires_at: convertUnixToTimestamp(_account.expires_at),
                    token_type: _account.token_type,
                    scope: _account.scope,
                    id_token: _account.id_token,
                    created_at: new Date().toISOString(),
                    expires_at_pending: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
                  })

                if (pendingError) {
                  console.error('Error creating pending link:', pendingError)
                  return false
                }

                // Redirect to verification page instead of signing in
                return `/auth/verify-account-link?email=${encodeURIComponent(user.email!)}&provider=${_account.provider}`
              }

              // If no password exists, safe to auto-link (OAuth-only account)
              const { error: linkError } = await supabaseAdmin
                .from('accounts')
                .insert({
                  user_id: existingUser.id,
                  provider: _account.provider,
                  provider_account_id: _account.providerAccountId,
                  access_token: _account.access_token,
                  refresh_token: _account.refresh_token,
                  expires_at: convertUnixToTimestamp(_account.expires_at),
                  token_type: _account.token_type,
                  scope: _account.scope,
                  id_token: _account.id_token
                })

              if (linkError) {
                console.error('Error linking account:', linkError)
                return false
              }
            } else {
              // Account already exists, just update tokens
              const { error: updateError } = await supabaseAdmin
                .from('accounts')
                .update({
                  access_token: _account.access_token,
                  refresh_token: _account.refresh_token,
                  expires_at: convertUnixToTimestamp(_account.expires_at),
                  token_type: _account.token_type,
                  scope: _account.scope,
                  id_token: _account.id_token
                })
                .eq('id', existingAccount.id)

              if (updateError) {
                console.error('Error updating account:', updateError)
                return false
              }
            }

            // Update user with OAuth info if missing
            if (!existingUser.avatar_url && googleProfile?.picture) {
              await supabaseAdmin
                .from('users')
                .update({ avatar_url: googleProfile.picture })
                .eq('id', existingUser.id)
            }

            // Ensure NextAuth uses the correct user ID from our database
            user.id = existingUser.id

            return true
          } else {
            // Create new user with OAuth
            const { data: newUser, error: userError } = await supabaseAdmin
              .from('users')
              .insert({
                email: user.email,
                name: user.name || googleProfile?.name,
                avatar_url: googleProfile?.picture,
                email_verified: true,
                created_at: new Date().toISOString()
              })
              .select()
              .single()

            if (userError) {
              console.error('Error creating user:', userError)
              return false
            }

            // Create account record
            const { error: accountError } = await supabaseAdmin
              .from('accounts')
              .insert({
                user_id: newUser.id,
                provider: _account.provider,
                provider_account_id: _account.providerAccountId,
                access_token: _account.access_token,
                refresh_token: _account.refresh_token,
                expires_at: convertUnixToTimestamp(_account.expires_at),
                token_type: _account.token_type,
                scope: _account.scope,
                id_token: _account.id_token
              })

            if (accountError) {
              console.error('Error creating account:', accountError)
              return false
            }

            // Ensure NextAuth uses the correct user ID from our database
            user.id = newUser.id

            return true
          }
        } catch (error) {
          console.error('SignIn error:', error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      // On first sign-in, or if we don't have the user ID yet, fetch from database
      if ((user?.email || token.email) && !token.id) {
        const email = user?.email || token.email
        try {
          const { data: dbUser, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, avatar_url')
            .eq('email', email)
            .single()

          if (dbUser && !error) {
            token.id = dbUser.id
            token.name = dbUser.name
            token.email = dbUser.email
            token.picture = dbUser.avatar_url
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error)
        }
      }
      
      // If we still don't have an ID but we have user data, use it
      if (user && !token.id) {
        token.id = user.id
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: 'jwt'
  }
} 