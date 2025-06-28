'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface DebugData {
  session: {
    user: {
      id: string
      name?: string
      email?: string
      image?: string
    }
  }
  database: {
    user: any
    userError?: string
    accounts: any[]
    accountsError?: string
  }
  debug: {
    sessionUserId: string
    sessionEmail: string
    dbUserId: string
    dbEmail: string
    accountCount: number
    linkedProviders: string[]
  }
}

export default function DebugPage() {
  const { data: session } = useSession()
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessionData, setSessionData] = useState<Record<string, unknown> | null>(null)
  const [dbData, setDbData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchDebugData()
    }
  }, [session])

  const fetchDebugData = async () => {
    try {
      const response = await fetch('/api/debug/session')
      if (response.ok) {
        const data = await response.json()
        setDebugData(data)
      } else {
        setError('Failed to fetch debug data')
      }
    } catch (err) {
      console.error('Debug fetch error:', err)
      setLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Profile
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Debug Information</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          {debugData && (
            <div className="space-y-6">
              {/* Account Linking Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Linking Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">✅ Working Correctly If:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Session User ID = Database User ID</li>
                      <li>• Same email in both session and database</li>
                      <li>• Multiple providers for same user ID</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Problem If:</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Different User IDs</li>
                      <li>• Missing linked accounts</li>
                      <li>• Mismatched emails</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Status Check</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">User ID Match:</span>
                    <span className={debugData.debug.sessionUserId === debugData.debug.dbUserId ? 'text-green-600' : 'text-red-600'}>
                      {debugData.debug.sessionUserId === debugData.debug.dbUserId ? '✅ Matches' : '❌ Different'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">Email Match:</span>
                    <span className={debugData.debug.sessionEmail === debugData.debug.dbEmail ? 'text-green-600' : 'text-red-600'}>
                      {debugData.debug.sessionEmail === debugData.debug.dbEmail ? '✅ Matches' : '❌ Different'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">Linked Accounts:</span>
                    <span className="text-blue-600">
                      {debugData.debug.accountCount} provider(s): {debugData.debug.linkedProviders.join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Session Data */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Data</h2>
                <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-auto">
                  {JSON.stringify(debugData.session, null, 2)}
                </pre>
              </div>

              {/* Database Data */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Data</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">User Record:</h3>
                    <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-auto">
                      {JSON.stringify(debugData.database.user, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Linked Accounts:</h3>
                    <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-auto">
                      {JSON.stringify(debugData.database.accounts, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Test Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-yellow-900 mb-4">Testing Account Linking</h2>
                <div className="text-yellow-800 space-y-2">
                  <p><strong>To test account linking:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Sign up with email/password</li>
                    <li>Set a username in your profile</li>
                    <li>Sign out and sign in with Google OAuth (same email)</li>
                    <li>Check this debug page - you should see the same User ID and username</li>
                    <li>Visit your profile page - username should still be there</li>
                  </ol>
                  <p className="mt-4"><strong>Expected result:</strong> Same profile data regardless of sign-in method!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 