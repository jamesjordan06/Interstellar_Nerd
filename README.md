# 🚀 Interstellar Nerd Forum

A modern, space-themed community forum built with Next.js 15, Supabase, and NextAuth. Explore the cosmos, discuss cutting-edge technology, and connect with fellow space enthusiasts!

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-Authentication-purple?style=for-the-badge&logo=next-auth&logoColor=white)

## ✨ Features

### 🌌 Public Forum Access
- **Browse freely** - No account required to read posts and replies
- **Space-themed categories** - Organized discussions on missions, astronomy, technology, SETI, and more
- **Smart search** - Find posts by keywords, topics, or categories
- **Space Fact of the Day** - Daily space knowledge powered by database

### 🔐 Authenticated Features
- **Multi-provider OAuth** - Sign in with Google, GitHub, Discord
- **Email/Password authentication** - Traditional account creation
- **Post creation & replies** - Share your thoughts and engage in discussions
- **Like & bookmark system** - Save interesting posts and show appreciation
- **User profiles** - Customizable profiles with activity tracking
- **Real-time interactions** - Instant likes, bookmarks, and replies

### 🛡️ Security & Privacy
- **Secure OAuth integration** - Account linking with password verification
- **Email verification** - Powered by Resend for reliable delivery
- **Session management** - NextAuth.js handles secure sessions
- **Database security** - Row-level security with Supabase

### 📱 Modern User Experience
- **Responsive design** - Beautiful on desktop, tablet, and mobile
- **Fast performance** - Next.js 15 with App Router for optimal speed
- **Real-time updates** - Live interactions without page refreshes
- **Intuitive navigation** - Easy-to-use interface with breadcrumbs

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library with modern hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time features
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication system
- **[Resend](https://resend.com/)** - Email delivery service

### Authentication Providers
- **Google OAuth** - Gmail account integration
- **GitHub OAuth** - Developer-friendly sign-in
- **Discord OAuth** - Gaming community integration
- **Email/Password** - Traditional authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OAuth provider credentials (Google, GitHub, Discord)
- Resend account for email delivery

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jamesjordan06/Interstellar_Nerd.git
   cd Interstellar_Nerd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local` file:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # OAuth Providers
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   
   # Email
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Set up the database**
   
   Run the following SQL files in your Supabase dashboard:
   ```bash
   # Core schema
   supabase-schema.sql
   
   # Sample forum data (optional)
   space-forum-complete.sql
   
   # Space facts (optional)
   space-facts-table.sql
   
   # Like/bookmark tables
   likes-bookmarks-tables.sql
   
   # Account linking security
   pending-account-links-table-final.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── forum/         # Forum functionality
│   │   ├── profile/       # User profile management
│   │   └── space-facts/   # Space facts system
│   ├── auth/              # Authentication pages
│   ├── forum/             # Forum pages
│   ├── profile/           # Profile management
│   └── admin/             # Admin interface
├── components/            # Reusable React components
│   └── auth/              # Authentication components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── supabase.ts        # Supabase client
│   └── resend.ts          # Email service
├── providers/             # React context providers
├── public/                # Static assets
└── *.sql                  # Database schema and data
```

## 🌟 Key Features Explained

### Public Browsing
The forum follows modern standards (like Reddit or Stack Overflow) where visitors can explore content freely. Authentication is only required for:
- Creating posts and replies
- Liking and bookmarking content
- Accessing user profiles and settings

### Space-Themed Categories
- 🚀 **Space Missions & Exploration** - Artemis, Mars missions, space agencies
- 🌌 **Astronomy & Astrophysics** - Black holes, galaxies, cosmic phenomena  
- ⚙️ **Space Technology & Engineering** - Rockets, satellites, propulsion
- 👽 **SETI & Astrobiology** - Search for life, exoplanets, alien theories
- 📚 **Science Fiction & Media** - Movies, books, games, reviews
- 💬 **Off-Topic & General** - Community discussions, introductions

### Smart Authentication System
- **Account Linking**: OAuth and email accounts can be securely linked
- **Email Verification**: Powered by Resend for reliable delivery
- **Password Security**: bcrypt hashing with verification requirements
- **Session Management**: Secure JWT tokens with NextAuth.js

## 🔧 Configuration

### OAuth Setup
See `OAUTH_SETUP.md` for detailed instructions on configuring:
- Google OAuth (Google Cloud Console)
- GitHub OAuth (GitHub Developer Settings)
- Discord OAuth (Discord Developer Portal)

### Database Schema
The forum uses a comprehensive PostgreSQL schema with:
- User management with OAuth account linking
- Categories and posts with rich metadata
- Reply system with threading support
- Like and bookmark functionality
- Space facts database with admin management

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Automatic deployments on push to main

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Great for full-stack apps
- **DigitalOcean**: App Platform support

## 🤝 Contributing

We welcome contributions! Please:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Space Data**: Various NASA and ESA sources
- **UI Inspiration**: Modern forum and community platforms
- **Community**: The amazing space and technology enthusiasts

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: See individual `.md` files in the project
- **Issues**: [GitHub Issues](https://github.com/jamesjordan06/Interstellar_Nerd/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jamesjordan06/Interstellar_Nerd/discussions)

---

**Made with ❤️ for the space community** 🌌
#   T r i g g e r   d e p l o y m e n t   -   0 6 / 2 8 / 2 0 2 5   1 9 : 3 1 : 1 7  
 