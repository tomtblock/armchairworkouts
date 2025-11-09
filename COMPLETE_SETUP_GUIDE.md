# Complete Setup Guide: Workout Forge App

This is a comprehensive, step-by-step guide to get your Workout Forge app fully operational with payments, subscriptions, and database storage.

---

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] A Whop developer account ([Sign up here](https://whop.com/dashboard/developer/))
- [ ] A Supabase account ([Sign up here](https://supabase.com))
- [ ] Your app codebase cloned and dependencies installed (`pnpm install`)

---

## Part 1: Supabase Database Setup

### Step 1.1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in or create an account
3. Select your project (or create a new one if you haven't)
   - Project name: "Workout Forge" (or your preferred name)
   - Database password: Save this securely
   - Region: Choose closest to your users

### Step 1.2: Create Workout History Table

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar
2. Click **New query** button (top right)
3. Open the file `supabase-migration.sql` from your project
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click **Run** (or press `Cmd/Ctrl + Enter`)
7. **Verify success**: You should see "Success. No rows returned" or similar

**What this creates:**
- `workout_history` table for storing Premium user workouts
- Indexes for faster queries
- Row Level Security policies

### Step 1.3: Create User Subscriptions Table

1. Still in SQL Editor, click **New query** again
2. Open the file `supabase-subscription-migration.sql` from your project
3. Copy the entire contents
4. Paste into a new query tab
5. Click **Run**
6. **Verify success**: Should see success message

**What this creates:**
- `user_subscriptions` table for tracking free spins and subscription tiers
- Automatic timestamp updates
- Security policies

### Step 1.4: Verify Tables Were Created

1. In Supabase dashboard, click **Table Editor** in the left sidebar
2. You should see two tables:
   - `workout_history`
   - `user_subscriptions`
3. Click on each table to verify the columns are correct

**Expected columns for `workout_history`:**
- id (uuid)
- user_id (text)
- sets (integer)
- workout (text)
- amount (integer)
- reps_time (text)
- type (text)
- description (text)
- created_at (timestamp)

**Expected columns for `user_subscriptions`:**
- id (uuid)
- user_id (text, unique)
- tier (text)
- free_spins_remaining (integer)
- created_at (timestamp)
- updated_at (timestamp)

---

## Part 2: Whop Product Setup

### Step 2.1: Access Whop Developer Dashboard

1. Go to [https://whop.com/dashboard/developer/](https://whop.com/dashboard/developer/)
2. Sign in to your Whop account
3. Navigate to **Apps** in the left sidebar
4. Select your Workout Forge app (or create one if needed)

### Step 2.2: Create Standard Product

1. In your Whop dashboard, go to **Products** (not in Developer section, but main dashboard)
2. Click **Create Product** button (usually top right)
3. Fill in the product details:
   - **Product Name**: `Workout Forge - Standard`
   - **Description**: `Unlimited workout generations. Perfect for users who want endless variety.`
   - **Price**: `1.99`
   - **Currency**: Select `GBP` (British Pounds)
   - **Billing Period**: Select `Monthly` (recurring subscription)
   - **Visibility**: Set to `Public` (so users can see it)
4. Click **Create Product** or **Save**
5. **IMPORTANT**: Copy the Product ID
   - Look for a field labeled "Product ID" or check the URL
   - Format: `prod_xxxxxxxxxxxxxx`
   - Save this somewhere safe (you'll need it in Step 3)

### Step 2.3: Create Premium Product

1. Still in Products, click **Create Product** again
2. Fill in the details:
   - **Product Name**: `Workout Forge - Premium`
   - **Description**: `Unlimited generations, workout history storage, and detailed analytics dashboard.`
   - **Price**: `3.99`
   - **Currency**: `GBP`
   - **Billing Period**: `Monthly` (recurring)
   - **Visibility**: `Public`
3. Click **Create Product** or **Save**
4. **IMPORTANT**: Copy the Premium Product ID
   - Format: `prod_xxxxxxxxxxxxxx` (different from Standard)
   - Save this alongside the Standard Product ID

### Step 2.4: Verify Products

1. In your Products list, you should now see:
   - Workout Forge - Standard (£1.99/month)
   - Workout Forge - Premium (£3.99/month)
2. Click on each product to verify the details are correct
3. Note the Product IDs if you haven't already

---

## Part 3: Environment Variables Configuration

### Step 3.1: Locate Your Environment Files

1. In your project root directory, check if you have:
   - `.env.development` (for local development)
   - `.env.local` (alternative local file)
   - `.env.example` (template - don't edit this)

### Step 3.2: Create/Update .env.development

1. If `.env.development` doesn't exist, create it:
   
   touch .env.development
   2. Open `.env.development` in your code editor

3. Add or update these variables:

# Whop Configuration (from your Whop Dashboard)
WHOP_API_KEY=your_whop_api_key_here
WHOP_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_WHOP_APP_ID=app_xxxxxxxxxxxxxx

# Whop Product IDs (from Step 2)
WHOP_STANDARD_PRODUCT_ID=prod_xxxxxxxxxxxxxx
WHOP_PREMIUM_PRODUCT_ID=prod_xxxxxxxxxxxxxx

# Supabase Configuration (from your Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here### Step 3.3: Get Whop Credentials

1. Go to [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
2. Select your app
3. Go to **Settings** → **API Keys**
4. Copy the **API Key** → paste into `WHOP_API_KEY`
5. Go to **Settings** → **Webhooks**
   - If no webhook exists, create one:
     - URL: `https://your-domain.com/api/webhooks` (use localhost for dev: `http://localhost:3000/api/webhooks`)
     - Events: Select `payment.succeeded`
   - Copy the **Webhook Secret** → paste into `WHOP_WEBHOOK_SECRET`
6. In **Settings** → **General**, find **App ID**
   - Format: `app_xxxxxxxxxxxxxx`
   - Copy → paste into `NEXT_PUBLIC_WHOP_APP_ID`

### Step 3.4: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** (gear icon) → **API**
4. Under **Project URL**, copy the URL → paste into `NEXT_PUBLIC_SUPABASE_URL`
5. Under **Project API keys**:
   - Find **anon public** key → copy → paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Find **service_role** key → copy → paste into `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **WARNING**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code!

### Step 3.5: Add Product IDs

1. In your `.env.development`, replace:
   - `WHOP_STANDARD_PRODUCT_ID=prod_xxxxxxxxxxxxxx` with your actual Standard product ID from Step 2.2
   - `WHOP_PREMIUM_PRODUCT_ID=prod_xxxxxxxxxxxxxx` with your actual Premium product ID from Step 2.3

### Step 3.6: Verify Environment File

Your `.env.development` should now look like this (with your actual values):

WHOP_API_KEY=whop_live_xxxxxxxxxxxxxx
WHOP_WEBHOOK_SECRET=whop_webhook_xxxxxxxxxxxxxx
NEXT_PUBLIC_WHOP_APP_ID=app_xxxxxxxxxxxxxx
WHOP_STANDARD_PRODUCT_ID=prod_xxxxxxxxxxxxxx
WHOP_PREMIUM_PRODUCT_ID=prod_xxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://eymckbippqdhyztqybgws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
**Important**: 
- Never commit `.env.development` to git (it should be in `.gitignore`)
- Use different values for production (set in Vercel/deployment platform)

---

## Part 4: Attach Products to Experience

### Step 4.1: Navigate to Your Experience

1. In Whop Dashboard, go to your **Company/Whop**
2. Navigate to **Tools** or **Apps** section
3. Find your Workout Forge experience/app
4. Click on it to open

### Step 4.2: Attach Standard Product

1. In the experience settings, look for **Products** or **Access Passes** section
2. Click **Attach Product** or **Add Product**
3. Search for or select "Workout Forge - Standard"
4. Click **Attach** or **Save**

### Step 4.3: Attach Premium Product

1. Still in the Products section, click **Attach Product** again
2. Select "Workout Forge - Premium"
3. Click **Attach** or **Save**

### Step 4.4: Verify Products Are Attached

1. In the Products section, you should now see:
   - Workout Forge - Standard
   - Workout Forge - Premium
2. Both should show as "Attached" or have a checkmark

---

## Part 5: Testing the Integration

### Step 5.1: Start Development Server

1. Open terminal in your project directory
2. Run:
   
   pnpm dev
   3. Wait for server to start (should show `http://localhost:3000`)
4. If you see errors, check:
   - All environment variables are set correctly
   - Database tables exist in Supabase
   - No syntax errors in `.env.development`

### Step 5.2: Connect App in Whop

1. In your Whop dashboard, go to your Company/Whop
2. Navigate to **Tools** → **Add App**
3. Select your Workout Forge app
4. In the app preview window, look for settings icon (top right)
5. Select **"localhost"** from the dropdown
6. Enter port **3000**
7. The app should load in the preview

### Step 5.3: Test Free Tier

1. As a new user (or test account), you should see:
   - Subscription status bar showing "Free Spins: 2 remaining"
   - Ability to generate workouts
2. Generate a workout (click "ACTIVATE" or spin button)
3. **Verify**:
   - Workout generates successfully
   - Free spins count decreases to 1
   - Status bar updates
4. Generate another workout
5. **Verify**:
   - Free spins count decreases to 0
   - Status bar shows "Free Spins: 0 remaining"
6. Try to generate again
7. **Expected**: Upgrade modal should appear

### Step 5.4: Test Standard Tier (Optional - Requires Purchase)

1. Purchase the Standard product through Whop
2. Refresh the app
3. **Verify**:
   - Status bar shows "✓ Standard Member - Unlimited Generations"
   - Can generate unlimited workouts
   - No free spin counter
   - Workouts are NOT saved to database (only localStorage)

### Step 5.5: Test Premium Tier (Optional - Requires Purchase)

1. Purchase the Premium product through Whop
2. Refresh the app
3. **Verify**:
   - Status bar shows "⭐ Premium Member - Unlimited + Storage + Analytics"
   - Can generate unlimited workouts
   - Workouts ARE saved to Supabase
4. Check Supabase:
   - Go to Supabase Dashboard → Table Editor → `workout_history`
   - You should see your workouts with your user_id
5. Test Dashboard:
   - Navigate to `/dashboard/[companyId]` (replace with your company ID)
   - Should see analytics dashboard with your workout data
   - If you see upgrade prompt, subscription check may need debugging

### Step 5.6: Verify Database Storage

1. Generate a few workouts as Premium user
2. Go to Supabase Dashboard → Table Editor → `workout_history`
3. **Verify**:
   - Rows exist with your user_id
   - Data includes: sets, workout name, amount, reps_time, type
   - `created_at` timestamps are recent
4. Check `user_subscriptions` table:
   - Should have a row with your user_id
   - `tier` should be "premium" (or "free" if testing free tier)
   - `free_spins_remaining` should be 0 for premium/standard, or 0-2 for free

---

## Part 6: Production Deployment

### Step 6.1: Prepare for Production

1. Push your code to GitHub (if not already):ash
   git add .
   git commit -m "Setup complete"
   git push
   ### Step 6.2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Import your repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
6. **Add Environment Variables**:
   - Click **Environment Variables**
   - Add ALL variables from `.env.development`:
     - `WHOP_API_KEY`
     - `WHOP_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_WHOP_APP_ID`
     - `WHOP_STANDARD_PRODUCT_ID`
     - `WHOP_PREMIUM_PRODUCT_ID`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - For each variable:
     - Name: (variable name)
     - Value: (your production value - can be same as dev for testing)
     - Environment: Select "Production", "Preview", and "Development"
7. Click **Deploy**

### Step 6.3: Update Whop Dashboard with Production URL

1. Wait for Vercel deployment to complete
2. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
3. Go to Whop Developer Dashboard → Your App → Settings
4. Update **Base URL** to your Vercel URL
5. Update webhook URL to: `https://your-app.vercel.app/api/webhooks`
6. Save changes

### Step 6.4: Test Production

1. Visit your production URL
2. Test all features:
   - Free tier spins
   - Subscription checks
   - Premium features (if you have access)
3. Check Vercel logs for any errors
4. Check Supabase logs for database operations

---

## Troubleshooting Common Issues

### Issue: Spins Not Working

**Symptoms**: Clicking activate/spin does nothing

**Solutions**:
1. Check browser console for errors (F12 → Console tab)
2. Verify subscription API is working:
   - Open Network tab in browser dev tools
   - Look for `/api/subscription` request
   - Check if it returns 200 status
3. Check if `user_subscriptions` table exists in Supabase
4. Verify environment variables are set correctly
5. Restart dev server: `pnpm dev`

### Issue: "Database table not found" Error

**Symptoms**: Console shows error about missing table

**Solutions**:
1. Go to Supabase → SQL Editor
2. Re-run the migration SQL from `supabase-migration.sql`
3. Verify table exists in Table Editor
4. Check table name matches exactly: `workout_history` and `user_subscriptions`

### Issue: Subscription Status Not Updating

**Symptoms**: Status bar shows wrong tier or free spins not decrementing

**Solutions**:
1. Check Network tab → `/api/subscription` request
2. Verify product IDs in environment variables match Whop dashboard
3. Check Supabase `user_subscriptions` table for your user_id
4. Manually update in Supabase if needed (for testing)

### Issue: Premium Users Can't Access Dashboard

**Symptoms**: Dashboard shows upgrade prompt even for Premium users

**Solutions**:
1. Verify user has purchased Premium product in Whop
2. Check product ID in environment variable matches Whop product ID
3. Check browser console for subscription API errors
4. Verify `checkUserSubscription` function is checking correct product ID

### Issue: Workouts Not Saving to Database

**Symptoms**: Premium users generate workouts but nothing appears in Supabase

**Solutions**:
1. Check Network tab → `/api/workout-history` POST request
   - Should return 200 for Premium users
   - Should return 403 for non-Premium users
2. Verify `workout_history` table exists
3. Check Supabase logs for insert errors
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

---

## Verification Checklist

Use this checklist to ensure everything is set up correctly:

### Database
- [ ] `workout_history` table exists in Supabase
- [ ] `user_subscriptions` table exists in Supabase
- [ ] Both tables have correct columns
- [ ] Can see tables in Supabase Table Editor

### Whop Products
- [ ] Standard product created (£1.99/month)
- [ ] Premium product created (£3.99/month)
- [ ] Both products have correct Product IDs copied
- [ ] Products are attached to your experience

### Environment Variables
- [ ] `WHOP_API_KEY` set
- [ ] `WHOP_WEBHOOK_SECRET` set
- [ ] `NEXT_PUBLIC_WHOP_APP_ID` set
- [ ] `WHOP_STANDARD_PRODUCT_ID` set (matches Whop dashboard)
- [ ] `WHOP_PREMIUM_PRODUCT_ID` set (matches Whop dashboard)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set

### Functionality
- [ ] App loads without errors
- [ ] Free tier shows "2 free spins remaining"
- [ ] Can generate workouts (spins work)
- [ ] Free spins decrement correctly
- [ ] Upgrade modal appears when spins run out
- [ ] Premium users can save workouts (if tested)
- [ ] Premium users can access dashboard (if tested)

---

## Next Steps After Setup

1. **Customize the Upgrade Modal**: 
   - Edit `app/components/forge/UpgradeModal.tsx`
   - Add your product purchase URLs if you want direct links

2. **Set Up Webhooks** (Optional):
   - Configure webhook endpoint in Whop
   - Update `app/api/webhooks/route.ts` to handle subscription events
   - Automatically update user tier when payment succeeds

3. **Add Analytics** (Optional):
   - Enhance `PremiumDashboard.tsx` with more charts
   - Add date range filters
   - Export workout data

4. **Marketing**:
   - Share your Whop product links
   - Create promotional content
   - Set up affiliate links if desired

---

## Support Resources

- **Whop Documentation**: [https://dev.whop.com](https://dev.whop.com)
- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Whop Developer Discord**: [https://discord.gg/whop](https://discord.gg/whop)

---

## Quick Reference: File Locations

- Environment variables: `.env.development`
- Database migrations: 
  - `supabase-migration.sql`
  - `supabase-subscription-migration.sql`
- Subscription logic: `app/api/subscription/`
- Workout history API: `app/api/workout-history/route.ts`
- Main app component: `app/components/forge/WorkoutForgeApp.tsx`
- Premium dashboard: `app/components/forge/PremiumDashboard.tsx`
- Upgrade modal: `app/components/forge/UpgradeModal.tsx`

---

**Congratulations!** 🎉 Your Workout Forge app should now be fully operational with payments, subscriptions, and database storage!
