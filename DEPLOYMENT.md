# Vercel Deployment Guide

## Quick Setup

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Your Project → Settings → Environment Variables, add:
   
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_WEATHER_API_KEY=your_weatherapi_key
   VITE_HF_API_KEY=your_huggingface_api_key (optional)
   ```

4. **Configure Supabase Redirect URLs (IMPORTANT for OAuth)**
   
   In your Supabase Dashboard:
   - Go to **Authentication** → **URL Configuration**
   - Add your Vercel URLs to **Redirect URLs**:
     - `https://poshan-nbkhur5mo-krishn4nmols-projects.vercel.app/*`
     - `https://your-custom-domain.com/*` (if you have one)
     - `http://localhost:8080/*` (for local development)
   - Add the same URLs to **Site URL** (you can set the primary one)
   - Save the changes
   
   **For Google OAuth specifically:**
   - Go to **Authentication** → **Providers** → **Google**
   - Make sure Google OAuth is enabled
   - The redirect URI in Google Cloud Console should be:
     `https://[your-supabase-project].supabase.co/auth/v1/callback`

5. **Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Troubleshooting

### Blank Screen Issues

1. **Check Environment Variables**
   - Ensure all required environment variables are set in Vercel
   - Variables must start with `VITE_` to be accessible in the app

2. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments → Click on failed deployment
   - Check for build errors

3. **Verify Routing**
   - The `vercel.json` file handles SPA routing
   - All routes should redirect to `index.html`

4. **Clear Cache**
   - In Vercel Dashboard → Settings → General
   - Clear build cache and redeploy

### OAuth Redirect Issues

- **OAuth redirects to localhost**: 
  1. Go to Supabase Dashboard → Authentication → URL Configuration
  2. Add your Vercel deployment URL to the Redirect URLs list
  3. Make sure the URL format is: `https://your-app.vercel.app/*`
  4. Save and wait a few minutes for changes to propagate
  5. Try OAuth login again

- **OAuth not working after deployment**:
  - Verify redirect URLs are added in Supabase (see step 4 above)
  - Check that Google/Apple OAuth providers are enabled in Supabase
  - Ensure the redirect URI in Google Cloud Console matches Supabase callback URL

### Common Issues

- **Blank screen after deployment**: Check browser console for errors, verify environment variables
- **404 on refresh**: The `vercel.json` rewrites should handle this
- **API errors**: Verify all API keys are correctly set in Vercel environment variables
- **OAuth redirects to localhost**: Add Vercel URL to Supabase redirect URLs (see OAuth Redirect Issues above)

## Notes

- The `vercel.json` file configures:
  - SPA routing (all routes → index.html)
  - Asset caching
  - Build settings

- Environment variables are automatically injected during build
- Make sure to redeploy after adding/changing environment variables
