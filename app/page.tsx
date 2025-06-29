import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <Image
            src="/MainLogo.png"
            alt="Interstellar Nerd Forum"
            width={240}
            height={60}
            className="h-12 w-auto mx-auto mb-4"
          />
        </div>
        
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
          
          <Link
            href="/forum"
            className="w-full inline-flex justify-center py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Browse Forum (No Account Required)
          </Link>
        </div>

        <div className="mt-8 flex justify-center items-center space-x-2 text-sm text-gray-500">
          <Image
            src="/SmallIcon.png"
            alt="Icon"
            width={16}
            height={16}
            className="w-4 h-4"
          />
          <span>🚀 Explore • 🤖 Learn • 🌟 Connect</span>
        </div>
      </div>
    </div>
  )
}
