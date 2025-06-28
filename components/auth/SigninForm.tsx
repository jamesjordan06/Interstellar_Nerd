'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SigninForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [oauthProviders, setOauthProviders] = useState('')
  const [setupEmailSent, setSetupEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setShowPasswordSetup(false)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        console.log('Credentials sign-in error:', result.error)
        
        // Check if it's an OAuth user trying to sign in
        if (result.error.includes('OAUTH_USER:')) {
          const providers = result.error.split(':')[1]
          console.log('OAuth user detected, providers:', providers)
          setOauthProviders(providers)
          setShowPasswordSetup(true)
          setError('')
        } else if (result.error.includes('PASSWORD_NOT_SET')) {
          console.log('Password not set for user')
          setShowPasswordSetup(true)
          setOauthProviders('')
          setError('')
        } else {
          console.log('Other error:', result.error)
          setError('Invalid email or password')
        }
      } else {
        // Refresh session and redirect
        await getSession()
        router.push('/forum')
      }
    } catch (_error) {
      console.error('Sign in error:', _error)
      setError('Invalid email or password')
      setIsLoading(false)
    }
  }

  const handleSendPasswordSetup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSetupEmailSent(true)
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send setup email')
      }
    } catch (error) {
      setError('Failed to send setup email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignin = async () => {
    setIsLoading(true)
    setError('')
    try {
      console.log('Attempting Google sign-in...')
      // Let NextAuth handle the redirect naturally - this works better for OAuth
      await signIn('google', { callbackUrl: '/forum' })
    } catch (_error) {
      console.error('OAuth sign in error:', _error)
      setError('Failed to sign in with Google. Please try again.')
      setIsLoading(false)
    }
    // Note: setIsLoading(false) is not called on success because the page will redirect
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showPasswordSetup && !setupEmailSent && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Account Found!</h3>
          <p className="text-blue-800 text-sm mb-3">
            {oauthProviders 
              ? `Your account was created using ${oauthProviders}. To enable password login, we can send you a link to set up a password.`
              : 'Your account exists but no password is set. We can send you a link to set up a password.'
            }
          </p>
          <button
            onClick={handleSendPasswordSetup}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Password Setup Link'}
          </button>
          {oauthProviders && (
            <p className="text-xs text-blue-600 mt-2">
              Or continue signing in with {oauthProviders} below.
            </p>
          )}
        </div>
      )}

      {setupEmailSent && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-900 mb-2">Email Sent! 📧</h3>
          <p className="text-green-800 text-sm">
            We've sent a password setup link to <strong>{email}</strong>. 
            Check your inbox and follow the instructions to set up your password.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignin}
          disabled={isLoading}
          className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        
        {/* OAuth Setup Reminder */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            If Google sign-in doesn't work, check the <strong>OAUTH_SETUP.md</strong> file for configuration instructions.
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </div>
  )
} 