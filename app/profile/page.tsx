'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Image from 'next/image'
import Link from 'next/link'

interface UserProfile {
  id: string
  name: string
  email: string
  username?: string
  bio?: string
  avatar_url?: string
  created_at: string
  last_seen_at?: string
  email_verified: boolean
}

interface LinkedAccount {
  provider: string
  created_at: string
}

interface UserStats {
  post_count: number
  reply_count: number
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([])
  const [userStats, setUserStats] = useState<UserStats>({ post_count: 0, reply_count: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
      fetchLinkedAccounts()
      fetchUserStats()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditForm({
          name: data.profile.name || '',
          username: data.profile.username || '',
          bio: data.profile.bio || ''
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setIsLoading(false)
    }
  }

  const fetchLinkedAccounts = async () => {
    try {
      const response = await fetch('/api/profile/accounts')
      if (response.ok) {
        const data = await response.json()
        setLinkedAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/profile/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setIsEditing(false)
        setMessage('Profile updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setMessage('An error occurred while updating your profile')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🔍'
      case 'github':
        return '🐙'
      case 'facebook':
        return '📘'
      default:
        return '🔗'
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
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/forum"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Forum
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setEditForm({
                            name: profile?.name || '',
                            username: profile?.username || '',
                            bio: profile?.bio || ''
                          })
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      {profile?.avatar_url && (
                        <Image
                          src={profile.avatar_url}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{profile?.name}</h3>
                        {profile?.username && (
                          <p className="text-gray-600">@{profile.username}</p>
                        )}
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                      </div>
                    </div>

                    {profile?.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                        <p className="text-gray-600">{profile.bio}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Member Since</p>
                        <p className="text-gray-600">{formatDate(profile?.created_at || '')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email Verified</p>
                        <p className={profile?.email_verified ? 'text-green-600' : 'text-red-600'}>
                          {profile?.email_verified ? '✅ Verified' : '❌ Not Verified'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Forum Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts</span>
                    <span className="font-medium">{userStats.post_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Replies</span>
                    <span className="font-medium">{userStats.reply_count}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Total Contributions</span>
                    <span className="font-semibold">{userStats.post_count + userStats.reply_count}</span>
                  </div>
                </div>
              </div>

              {/* Linked Accounts */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Linked Accounts</h3>
                {linkedAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {linkedAccounts.map((account, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getProviderIcon(account.provider)}</span>
                          <div>
                            <p className="font-medium capitalize">{account.provider}</p>
                            <p className="text-xs text-gray-500">
                              Connected {formatDate(account.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className="text-green-600 text-sm">✓ Connected</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No accounts linked</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/profile/bookmarks"
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    🔖 View My Bookmarks
                    <span className="text-xs text-gray-400 block">See all your saved posts</span>
                  </Link>
                  <Link
                    href="/forum/create-post"
                    className="block w-full text-left px-4 py-2 text-sm text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                  >
                    ✏️ Create New Post
                    <span className="text-xs text-gray-400 block">Share something with the community</span>
                  </Link>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <Link
                    href="/profile/bookmarks"
                    className="block w-full text-left px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
                  >
                    🔖 My Bookmarks
                    <span className="text-xs text-gray-400 block">View your saved posts</span>
                  </Link>
                  <Link
                    href="/profile/username"
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    {profile?.username ? 'Change Username' : 'Set Username'}
                  </Link>
                  <Link
                    href="/profile/change-password"
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    Change Password
                  </Link>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100">
                    Two-Factor Authentication
                    <span className="text-xs text-gray-400 block">Coming Soon</span>
                  </button>
                  <Link
                    href="/profile/debug"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    Debug Account Linking
                    <span className="text-xs text-gray-400 block">Verify your accounts are properly linked</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 