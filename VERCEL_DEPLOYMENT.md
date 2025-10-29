# Vercel Deployment Guide

## Prerequisites
- Vercel account
- All environment variables ready
- MongoDB Atlas database (if not already set up)
- Stripe account with keys
- Clerk account with keys
- Clover API credentials

## Step 1: Push to GitHub (if not already done)
```bash
git checkout main
git merge claude/fix-admin-access-011CUXpAuB5hPMKgZbF69t2p
git push origin main
```

## Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `PROJECTAPOLLODEV/ontime-commerce`
4. Vercel will auto-detect Next.js

## Step 3: Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

### Required - Database
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

### Required - Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

### Required - Stripe Payment
```
STRIPE_SECRET_KEY=sk_live_xxxxx (use sk_test_ for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx (use pk_test_ for testing)
STRIPE_WEBHOOK_SECRET=(get this after setting up webhook - see below)
```

### Required - Clover Integration
```
CLOVER_BASE_URL=https://www.cloverimaging.com/access-point
CLOVER_ENV=production (or "sandbox" for testing)
CLOVER_API_KEY_PROD=your_production_api_key
CLOVER_API_KEY_SANDBOX=your_sandbox_api_key
```

### Optional - Site URL
```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your site will be live at `https://your-project.vercel.app`

## Step 5: Set Up Stripe Webhook (IMPORTANT!)
After deployment, orders won't be created unless you set up the Stripe webhook:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select event: `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy your app for the new variable to take effect

## Step 6: Set Up Admin User
1. Sign up on your live site
2. Get your Clerk userId from the Clerk Dashboard
3. In MongoDB, update your user's public metadata:
   ```javascript
   // In MongoDB Compass or Shell
   db.users.updateOne(
     { clerkId: "user_xxxxx" },
     { $set: { "publicMetadata.role": "admin" } }
   )
   ```
   OR use Clerk Dashboard:
   - Go to Users → Select your user
   - Click on "Metadata"
   - Add to Public Metadata: `{ "role": "admin" }`

## Step 7: Test Everything
- [ ] Homepage loads
- [ ] Products display with correct pricing
- [ ] Search works
- [ ] Cart functionality
- [ ] Checkout flow
- [ ] Stripe payment (use test card: 4242 4242 4242 4242)
- [ ] Order appears in admin panel
- [ ] Order appears in account page
- [ ] Track order page works
- [ ] Admin panel accessible
- [ ] Clover sync works

## Production Checklist
- [ ] Switch Stripe keys from test to live mode
- [ ] Update Stripe webhook to use live mode
- [ ] Switch Clover to production environment
- [ ] Set up custom domain in Vercel
- [ ] Configure DNS
- [ ] Test all payment flows with real cards
- [ ] Set up Vercel Analytics (optional)
- [ ] Set up error monitoring (Sentry, etc.)

## Troubleshooting

### Orders not appearing after checkout
- Check Stripe webhook is configured correctly
- Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
- Check Vercel function logs for errors

### MongoDB connection errors
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or add Vercel IPs to MongoDB whitelist
- Check connection string format

### Clerk authentication issues
- Verify both CLERK keys are set
- Make sure keys match your environment (dev vs prod)
- Check Clerk Dashboard for authorized domains

### Build failures
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify Node version compatibility

## Environment Variables Quick Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| MONGODB_URI | Yes | Database connection |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Yes | Client-side auth |
| CLERK_SECRET_KEY | Yes | Server-side auth |
| STRIPE_SECRET_KEY | Yes | Payment processing |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Yes | Client-side Stripe |
| STRIPE_WEBHOOK_SECRET | Yes | Webhook verification |
| CLOVER_BASE_URL | Yes | Clover API endpoint |
| CLOVER_ENV | Yes | Clover environment |
| CLOVER_API_KEY_PROD | Yes | Production API key |
| CLOVER_API_KEY_SANDBOX | Optional | Sandbox API key |
| NEXT_PUBLIC_SITE_URL | Optional | Site URL for links |

## Post-Deployment

### Custom Domain Setup
1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown by Vercel
4. Wait for SSL certificate (automatic)
5. Update Clerk allowed domains
6. Update Stripe webhook URL

### Monitoring
- Monitor Vercel function logs regularly
- Set up uptime monitoring (UptimeRobot, etc.)
- Enable Vercel Analytics for visitor insights
- Check MongoDB Atlas metrics for performance

### Updates
To deploy updates:
1. Push changes to GitHub
2. Vercel auto-deploys from main branch
3. Check deployment status in Vercel dashboard

## Support
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Clerk Docs: https://clerk.com/docs
