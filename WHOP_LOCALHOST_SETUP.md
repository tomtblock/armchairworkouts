# Connecting Localhost to Whop for Testing

This guide explains how to connect your local development server to Whop so you can test different subscription levels and features.

## Why You Need This

When you access `http://localhost:3000` directly in your browser, the app cannot authenticate with Whop because there's no Whop user token in the request headers. This causes errors like:
- "Failed to update free spins"
- "Failed to create checkout URL"
- "Authentication failed"

To test subscription levels (Free, Standard, Premium) and all features, you need to access your app **through Whop's interface** using the dev proxy.

## Step-by-Step Setup

### Step 1: Start Your Development Server

Your `package.json` already includes the Whop dev proxy. Just run:

```bash
pnpm dev
```

This will:
- Start the Whop dev proxy
- Start Next.js on `http://localhost:3000`
- Enable Whop authentication headers

You should see output like:
```
> whop-nextjs-app-template@0.2.0 dev
> whop-proxy --command 'next dev --turbopack'

Whop Dev Proxy running on port 3000
Next.js ready on http://localhost:3000
```

### Step 2: Connect in Whop Dashboard

1. **Go to your Whop Dashboard**
   - Visit [https://whop.com/dashboard](https://whop.com/dashboard)
   - Navigate to your Company/Whop

2. **Add Your App**
   - Go to the **Tools** section (or **Apps** section)
   - Click **Add App** or **Add Tool**
   - Select your Workout Forge app from the list

3. **Configure Localhost Connection**
   - In the app preview window, look for a **settings icon** (⚙️) in the top right corner
   - Click the settings icon
   - You should see a dropdown or input field for connection type
   - Select **"localhost"** from the dropdown
   - Enter port **3000** (or leave default if it's already set)
   - Click **Save** or **Connect**

4. **Verify Connection**
   - The app should now load in the Whop preview window
   - You should see your Workout Forge interface
   - The app will now have proper Whop authentication headers

### Step 3: Test Subscription Levels

Once connected through Whop, you can test different subscription levels:

#### Option A: Use Test Mode (Easiest)

1. **Enable Test Mode**
   - Open `.env.development` in your project
   - Add or update:
     ```
     ENABLE_TEST_MODE=true
     ```
   - Restart your dev server (`pnpm dev`)

2. **Test Features**
   - Test Mode grants Premium access automatically
   - All features will be available (unlimited spins, storage, analytics)
   - No need to actually purchase subscriptions

#### Option B: Test Real Subscription Levels

1. **Create Test Products in Whop**
   - Go to your Whop Dashboard → Products
   - Create test products for Standard and Premium tiers
   - Note the Product IDs

2. **Set Environment Variables**
   - In `.env.development`, set:
     ```
     WHOP_STANDARD_PRODUCT_ID=prod_xxxxxxxxxxxxxx
     WHOP_PREMIUM_PRODUCT_ID=prod_xxxxxxxxxxxxxx
     ```

3. **Purchase Test Subscriptions**
   - In the Whop preview, click "Upgrade" buttons
   - Complete test purchases (use test payment methods)
   - The app will detect your subscription level automatically

## Troubleshooting

### Error: "Authentication failed" or "Invalid user token"

**Solution:** Make sure you're accessing the app through Whop, not directly at `localhost:3000`.

1. Check that the dev server is running with `whop-proxy`
2. Verify you selected "localhost" in Whop dashboard settings
3. Make sure port 3000 matches your dev server port

### Error: "Failed to create checkout URL"

**Solution:** This happens when:
- Not connected through Whop (see above)
- Product IDs are missing in environment variables
- Whop API key is incorrect

Check:
1. `.env.development` has `WHOP_STANDARD_PRODUCT_ID` and `WHOP_PREMIUM_PRODUCT_ID`
2. `WHOP_API_KEY` is set correctly
3. You're accessing through Whop (not direct localhost)

### Error: "Failed to update free spins"

**Solution:** This usually means:
- Not connected through Whop (authentication failing)
- Supabase connection issue
- Database table missing

Check:
1. You're accessing through Whop dashboard
2. Supabase credentials are set in `.env.development`
3. `user_subscriptions` table exists in Supabase

### Dev Server Won't Start

**Solution:**
1. Make sure port 3000 is not in use:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```
2. Check that `@whop-apps/dev-proxy` is installed:
   ```bash
   pnpm install
   ```
3. Restart the dev server:
   ```bash
   pnpm dev
   ```

## Quick Reference

- **Direct localhost**: ❌ No authentication, errors will occur
- **Through Whop dashboard**: ✅ Full authentication, all features work
- **Test Mode**: ✅ Bypasses authentication, grants Premium access

## Next Steps

Once connected:
1. Test Free tier (default) - should show 2 free spins
2. Test Standard tier - unlimited generations, no storage
3. Test Premium tier - full access with storage and analytics
4. Test upgrade flow - click "Upgrade" buttons and verify checkout URLs

For more details, see:
- `TEST_MODE.md` - Using test mode for development
- `COMPLETE_SETUP_GUIDE.md` - Full setup instructions
- `WHOP_SETUP.md` - Whop-specific configuration


