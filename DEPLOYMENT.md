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

4. **Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

5. **Deploy**
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

### Common Issues

- **Blank screen after deployment**: Check browser console for errors, verify environment variables
- **404 on refresh**: The `vercel.json` rewrites should handle this
- **API errors**: Verify all API keys are correctly set in Vercel environment variables

## Notes

- The `vercel.json` file configures:
  - SPA routing (all routes → index.html)
  - Asset caching
  - Build settings

- Environment variables are automatically injected during build
- Make sure to redeploy after adding/changing environment variables
