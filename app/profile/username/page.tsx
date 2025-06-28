'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function UsernamePage() {
  const { data: session } = useSession()
  const [currentUsername, setCurrentUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'taken' | 'invalid' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCurrentUsername()
  }, [session])

  useEffect(() => {
    if (newUsername && newUsername !== currentUsername) {
      const debounceTimer = setTimeout(() => {
        checkUsernameAvailability(newUsername)
      }, 500)
      return () => clearTimeout(debounceTimer)
    } else {
      setAvailabilityStatus(null)
    }
  }, [newUsername, currentUsername])

  const fetchCurrentUsername = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setCurrentUsername(data.profile.username || '')
        setNewUsername(data.profile.username || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setAvailabilityStatus('invalid')
      return
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      setAvailabilityStatus('invalid')
      return
    }

    setIsCheckingAvailability(true)
    try {
      const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`)
      const data = await response.json()
      
      if (response.ok) {
        setAvailabilityStatus(data.available ? 'available' : 'taken')
      } else {
        setAvailabilityStatus('invalid')
      }
    } catch (error) {
      console.error('Error checking username:', error)
      setAvailabilityStatus(null)
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    if (newUsername === currentUsername) {
      setError('Please enter a different username')
      setIsSaving(false)
      return
    }

    if (availabilityStatus !== 'available' && newUsername !== '') {
      setError('Please choose an available username')
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch('/api/profile/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentUsername(newUsername)
        setSuccess(true)
        setTimeout(() => {
          router.push('/profile')
        }, 2000)
      } else {
        setError(data.error || 'Failed to update username')
      }
    } catch (_) {
      setError('Failed to update username. Please try again.')
      setIsLoading(false)
    }
  }

  const getAvailabilityMessage = () => {
    if (isCheckingAvailability) {
      return <span className="text-gray-500 text-sm">Checking availability...</span>
    }

    switch (availabilityStatus) {
      case 'available':
        return <span className="text-green-600 text-sm">✓ Username is available</span>
      case 'taken':
        return <span className="text-red-600 text-sm">✗ Username is already taken</span>
      case 'invalid':
        return <span className="text-red-600 text-sm">✗ Username must be 3+ characters, letters, numbers, dashes, and underscores only</span>
      default:
        return null
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

  if (success) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Username Updated! 👤</h2>
              <p className="text-gray-600 mb-6">
                Your username has been changed to <strong>@{newUsername}</strong>
              </p>
              <p className="text-sm text-gray-500">Redirecting to profile...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">
            {currentUsername ? 'Change Username' : 'Set Username'}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {currentUsername 
              ? `Current username: @${currentUsername}` 
              : 'Choose a unique username for your profile'
            }
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, ''))}
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your_username"
                    minLength={3}
                    maxLength={30}
                  />
                </div>
                <div className="mt-2 min-h-[20px]">
                  {getAvailabilityMessage()}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  3-30 characters. Letters, numbers, dashes, and underscores only.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Username Tips
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Choose something memorable and professional</li>
                        <li>You can change it later, but try to pick one you'll keep</li>
                        <li>This will be displayed on your posts and profile</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving || availabilityStatus !== 'available' || isCheckingAvailability}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Updating...' : (currentUsername ? 'Change Username' : 'Set Username')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/profile" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 