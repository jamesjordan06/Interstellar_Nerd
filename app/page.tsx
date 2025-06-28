import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Interstellar Nerd Forum
        </h1>
        <p className="text-gray-600 mb-8">
          Join our community of space enthusiasts and tech nerds! 
          Connect with like-minded individuals and explore the cosmos of knowledge.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </Link>
          
          <Link
            href="/auth/signup"
            className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>🚀 Explore • 🤖 Learn • 🌟 Connect</p>
        </div>
      </div>
    </div>
  )
}
