import SigninForm from '@/components/auth/SigninForm'
import Image from 'next/image'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/forum" className="flex justify-center mb-8">
          <Image
            src="/MainLogo.png"
            alt="Interstellar Nerd Forum"
            width={240}
            height={60}
            className="h-12 w-auto"
          />
        </Link>
      </div>
      <SigninForm />
    </div>
  )
} 