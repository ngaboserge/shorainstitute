# Production Deployment Guide

## Environment Configuration

### Site URL Configuration

The invitation links and other site-wide URLs are configured via environment variables.

**Important:** Update your `.env` file with the production URL:

```env
# For Production
SITE_URL=https://www.shorainstitute.com
VITE_SITE_URL=https://www.shorainstitute.com

# For Development/Local Testing
# SITE_URL=http://localhost:3000
# VITE_SITE_URL=http://localhost:3000
```

### What Uses VITE_SITE_URL?

1. **Learner Invitation Links** - Generated in:
   - `src/components/modals/InviteLearnersModal.jsx`
   - `src/pages/institutional/Assignments.jsx`
   
2. **Payment Return URLs** - XentriPay redirects back to your site after payment

3. **Webhook Callbacks** - External services use this to send notifications

### Deployment Checklist

#### 1. Update Environment Variables

```bash
# Copy .env.example to .env if you haven't already
cp .env.example .env

# Edit .env and set:
VITE_SITE_URL=https://www.shorainstitute.com
SITE_URL=https://www.shorainstitute.com
```

#### 2. Update Supabase Credentials

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### 3. Configure XentriPay for Production

```env
# Switch to production mode
XENTRIPAY_SANDBOX=false
XENTRIPAY_BASE_URL=https://xentripay.com
XENTRIPAY_API_KEY=your_production_api_key_here
```

#### 4. Build for Production

```bash
npm run build
```

This will create optimized files in the `dist/` directory.

#### 5. Deploy

Upload the `dist/` directory to your hosting provider (Vercel, Netlify, etc.)

#### 6. Configure Webhooks

Update your XentriPay webhook URL to:
```
https://www.shorainstitute.com/api/webhooks/xentripay
```

### Verifying Invitation Links

After deployment, test the invitation flow:

1. Go to Institutional Portal → Learners → Invite Learner
2. Create an invitation
3. Check the console log for the invitation link
4. It should show: `https://www.shorainstitute.com/invitation/accept?token=...`
5. **Not:** `http://localhost:3000/invitation/accept?token=...`

### Fallback Behavior

If `VITE_SITE_URL` is not set, the system will fall back to `window.location.origin`, which means:
- In development: `http://localhost:3000`
- In production: Your actual domain (e.g., `https://www.shorainstitute.com`)

**Best Practice:** Always set `VITE_SITE_URL` explicitly in your `.env` file.

### Domain Configuration

Make sure your domain is properly configured:

1. **DNS Records:** Point `www.shorainstitute.com` to your hosting provider
2. **SSL Certificate:** Ensure HTTPS is enabled
3. **Redirects:** Consider redirecting `shorainstitute.com` → `www.shorainstitute.com`

### Testing in Production

After deployment:

```bash
# Test the invitation endpoint
curl https://www.shorainstitute.com/invitation/accept?token=test

# Should not return 404
```

### Rollback

If you need to test locally again:

```env
# In .env
VITE_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000
```

Then restart your dev server:
```bash
npm run dev
```

## Support

If invitation links are still showing localhost after deployment:
1. Verify `.env` file has `VITE_SITE_URL=https://www.shorainstitute.com`
2. Rebuild the app: `npm run build`
3. Redeploy the `dist/` folder
4. Clear browser cache
5. Check browser console for the generated link

Remember: Environment variables starting with `VITE_` are baked into the build at build time, so you must rebuild after changing them.
