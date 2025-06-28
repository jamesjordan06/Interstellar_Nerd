import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Add debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('NextAuth Configuration Check:')
  console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing')
  console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing')
  console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing')
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 