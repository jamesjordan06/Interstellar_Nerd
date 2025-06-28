# Interstellar Nerd Forum

A modern forum application built with Next.js, Supabase, and NextAuth.js featuring seamless authentication with email/password and Google OAuth, including automatic account linking.

## 🚀 Features

- **Dual Authentication Methods**: Users can sign up/in with email & password OR Google OAuth
- **Smart Account Linking**: If a user signs up with email and later uses Google OAuth with the same email, accounts are automatically linked
- **Unified User Experience**: Same profile and forum access regardless of authentication method
- **Protected Routes**: Forum content is only accessible to authenticated users
- **Modern UI**: Clean, responsive design built with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v4
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js 18+ 
- A Supabase account and project
- A Google Cloud Console project (for OAuth)

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd interstellar-nerd
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings and copy:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)
3. In your Supabase SQL editor, run the schema from `supabase-schema.sql`

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 client credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

To generate a NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your forum!

## 🔐 Authentication Flow

### Account Linking Logic

The system implements intelligent account linking:

1. **Email + Password First**: User creates account with email/password
2. **OAuth Later**: Same user tries to sign in with Google using the same email
3. **Automatic Linking**: System detects existing email and links the OAuth account
4. **Unified Profile**: User now has one profile accessible via both methods

### Database Schema

- **`users` table**: Stores user profiles and email/password auth
- **`accounts` table**: Stores OAuth provider connections linked to users

## 📱 Usage

### For Users

1. **New User**: 
   - Visit the homepage
   - Choose "Sign Up" 
   - Use email/password OR Google OAuth
   - Get redirected to the forum

2. **Existing User**:
   - Click "Sign In"
   - Use either authentication method (accounts are linked)
   - Access your same profile and forum content

3. **Account Linking**:
   - Sign up with email/password
   - Later sign in with Google (same email)
   - Accounts automatically link - no duplicate profiles!

### For Developers

The authentication system is built with these key components:

- `lib/auth.ts`: NextAuth configuration with custom Supabase integration
- `lib/supabase.ts`: Supabase client setup for both client and server
- `components/auth/`: Sign-in and sign-up forms
- `app/api/auth/`: NextAuth API routes and custom signup endpoint
- `providers/SessionProvider.tsx`: Session management wrapper

## 🔧 Customization

### Adding More OAuth Providers

1. Install the provider package
2. Add provider configuration to `lib/auth.ts`
3. Update the sign-in callback to handle account linking
4. Add environment variables

### Extending User Profile

1. Update the `users` table schema in Supabase
2. Modify the NextAuth session and JWT callbacks
3. Update TypeScript interfaces
4. Adjust the UI components

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Update NEXTAUTH_URL to your production domain
5. Update Google OAuth redirect URIs

### Other Platforms

- Update NEXTAUTH_URL environment variable
- Ensure all environment variables are set
- Update OAuth callback URLs

## 🐛 Troubleshooting

### Common Issues

1. **NextAuth callback errors**: Check NEXTAUTH_URL and OAuth redirect URIs match exactly
2. **Supabase connection issues**: Verify your project URL and keys
3. **Account linking not working**: Check that email addresses match exactly
4. **Session not persisting**: Ensure NEXTAUTH_SECRET is set

### Debug Mode

Add this to your `.env.local` for detailed NextAuth logs:
```env
NEXTAUTH_DEBUG=true
```

## 📝 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ for the space and tech community! 🚀
