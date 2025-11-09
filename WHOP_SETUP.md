# Whop Payment & Subscription Setup Guide

This guide will help you set up the payment and subscription system for your Workout Forge app.

## Overview

Your app has three subscription tiers:
- **Free**: 2 free spins, no storage, no analytics
- **Standard** (£1.99/month): Unlimited generations, no storage, no analytics
- **Premium** (£3.99/month): Unlimited generations + storage + analytics

## Step 1: Create Products in Whop Dashboard

1. Go to your [Whop Dashboard](https://whop.com/dashboard/)
2. Navigate to **Products** → **Create Product**

### Create Standard Product

1. **Product Name**: "Workout Forge - Standard"
2. **Price**: £1.99/month (recurring)
3. **Description**: "Unlimited workout generations"
4. **Visibility**: Public
5. Copy the **Product ID** (format: `prod_xxxxxxxxxxxxxx`)

### Create Premium Product

1. **Product Name**: "Workout Forge - Premium"
2. **Price**: £3.99/month (recurring)
3. **Description**: "Unlimited generations, storage, and analytics"
4. **Visibility**: Public
5. Copy the **Product ID** (format: `prod_xxxxxxxxxxxxxx`)

## Step 2: Configure Environment Variables

Add these to your `.env.development` and production environment:

```env
WHOP_STANDARD_PRODUCT_ID=prod_xxxxxxxxxxxxxx
WHOP_PREMIUM_PRODUCT_ID=prod_xxxxxxxxxxxxxx
```

Replace `prod_xxxxxxxxxxxxxx` with the actual product IDs from Step 1.

## Step 3: Set Up Database Tables

Run both SQL migrations in your Supabase dashboard:

1. **Workout History Table**: Run `supabase-migration.sql`
2. **User Subscriptions Table**: Run `supabase-subscription-migration.sql`

## Step 4: Attach Products to Your Experience

1. In Whop Dashboard, go to your **Experience**
2. Navigate to **Products** section
3. **Attach** both Standard and Premium products to the experience
4. This allows users to purchase subscriptions directly from the app

## Step 5: Test the Integration

1. **Free Tier**: 
   - New users get 2 free spins automatically
   - After 2 spins, upgrade modal appears

2. **Standard Tier**:
   - User purchases Standard product
   - Gets unlimited generations
   - No storage/analytics access

3. **Premium Tier**:
   - User purchases Premium product
   - Gets unlimited generations
   - Can save workout history
   - Can access analytics dashboard at `/dashboard/[companyId]`

## How It Works

### Subscription Checking
- The app checks user's product access using `whopsdk.users.checkAccess()`
- Free spins are tracked in the `user_subscriptions` table
- Subscription status is cached and refreshed when needed

### Storage
- Only Premium users can save workouts to Supabase
- Free and Standard users use localStorage as fallback
- Workout history API checks subscription before saving

### Analytics
- Premium users can access `/dashboard/[companyId]` to see analytics
- Analytics include:
  - Total workouts, sets, reps
  - Top exercises with completion stats
  - Workouts by date and category

## Webhook Handling

The app includes webhook handling at `/api/webhooks/route.ts`. You can extend this to:
- Update subscription status when payment succeeds
- Reset free spins on subscription cancellation
- Handle subscription renewals

## Troubleshooting

**User can't access Premium features?**
- Verify product IDs in environment variables
- Check that products are attached to the experience
- Ensure user has purchased the correct product

**Free spins not decrementing?**
- Check that `user_subscriptions` table exists
- Verify Supabase connection
- Check browser console for errors

**Analytics not loading?**
- Verify user has Premium subscription
- Check that workout history table has data
- Ensure user has completed some workouts

## Next Steps

1. Set up products in Whop Dashboard
2. Add product IDs to environment variables
3. Run database migrations
4. Test with different subscription tiers
5. Customize upgrade modal with your product URLs (optional)

