# Google OAuth Setup Guide

## 🔧 Prerequisites

1. **Google Cloud Console Account**: You need a Google account
2. **Supabase Database**: Your forum database should be set up
3. **Local Development Environment**: Next.js app running locally

## 📝 Step-by-Step Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `interstellar-nerd-forum`
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on **Google+ API** and click "Enable"
4. Also enable **Google OAuth2 API** if available

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill out the required fields:
   - **App name**: `Interstellar Nerd Forum`
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. **Scopes**: Just click "Save and Continue" (default scopes are fine)
6. **Test users**: Add your email address for testing
7. Click "Save and Continue"

### 4. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Set the name: `Interstellar Nerd Forum Web Client`
5. **Authorized JavaScript origins**:
   - Add: `http://localhost:3000`
   - Add: `https://yourdomain.com` (for production)
6. **Authorized redirect URIs**:
   - Add: `http://localhost:3000/api/auth/callback/google`
   - Add: `https://yourdomain.com/api/auth/callback/google` (for production)
7. Click "Create"
8. **Copy the Client ID and Client Secret** - you'll need these!

### 5. Environment Configuration

Create or update your `.env.local` file:

```env
# Google OAuth - REQUIRED for OAuth to work
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth - REQUIRED
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_this_with_openssl_rand_base64_32

# Supabase - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend (for password setup emails) - OPTIONAL
RESEND_API_KEY=your_resend_api_key
```

To generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 6. Test the Setup

1. **Restart your development server** after adding environment variables
2. Go to `http://localhost:3000/auth/signin`
3. Click "Sign in with Google"
4. You should see the Google OAuth consent screen
5. After granting permission, you should be redirected to your forum

## 🚨 Common Issues & Solutions

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Check that your redirect URI in Google Console exactly matches:
`http://localhost:3000/api/auth/callback/google`

### Issue: Google button doesn't work/no popup
**Solutions**:
1. Check browser console for errors
2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
3. Make sure you restarted the dev server after adding env vars
4. Check that the Google Cloud project is active

### Issue: "Access blocked: This app's request is invalid"
**Solution**: 
1. Make sure OAuth consent screen is configured
2. Add your email to test users
3. Verify JavaScript origins are set correctly

### Issue: OAuth works but account linking doesn't work
**Solution**: 
1. Use the debug page at `/profile/debug` to check user IDs
2. Make sure the same email is used for both OAuth and email/password

## 🧪 Testing Account Linking

1. **Test 1**: Email → OAuth
   - Sign up with email/password
   - Set a username
   - Sign out
   - Sign in with Google (same email)
   - Username should still be there

2. **Test 2**: OAuth → Email
   - Sign up with Google
   - Try to sign in with email/password
   - Should prompt to set up password

3. **Debug**: Visit `/profile/debug` to verify account linking

## 📱 Production Deployment

When deploying to production:

1. **Update Google Console**:
   - Add your production domain to JavaScript origins
   - Add production callback URL: `https://yourdomain.com/api/auth/callback/google`

2. **Update Environment Variables**:
   - Set `NEXTAUTH_URL=https://yourdomain.com`
   - Copy all other environment variables to your hosting platform

3. **Verify SSL**: OAuth requires HTTPS in production

## 🔍 Debugging Tips

- Check browser Network tab for failed requests
- Look at server console for NextAuth debug logs
- Use `/profile/debug` page to verify account linking
- Test with different Google accounts
- Clear browser cookies if having session issues

That's it! Your Google OAuth should now work properly with account linking. 🚀 