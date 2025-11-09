# Supabase Setup Guide

This guide will help you set up Supabase for storing workout history in your Whop app.

## Step 1: Create the Database Table

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the **SQL Editor**
3. Run the SQL from `supabase-migration.sql` to create the `workout_history` table

Alternatively, you can copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS workout_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  sets INTEGER NOT NULL,
  workout TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reps_time TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_history_created_at ON workout_history(created_at DESC);

ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
```

## Step 2: Environment Variables

The Supabase credentials are already configured in the code with fallback values. However, for production, you should add them to your environment files:

### For `.env.development` or `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eymckbippqdhyztqybgws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bWNrYmlwcWRoeXp0cXliZ3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1Mzg5MjAsImV4cCI6MjA3ODExNDkyMH0.lofpIx9wHex4XbV6jx-uKLh-hePQZwV1wVzDYGa0PGw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bWNrYmlwcWRoeXp0cXliZ3dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUzODkyMCwiZXhwIjoyMDc4MTE0OTIwfQ.MVpceOZaVRtFx6HixJsImjx3SzfuZ8D4AILN9Tgs238
```

**Important:** 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be exposed in client-side code
- `SUPABASE_SERVICE_ROLE_KEY` should **NEVER** be exposed to the client - it's only used in server-side API routes

## Step 3: How It Works

1. **User Authentication**: The app uses Whop's authentication system to identify users
2. **API Routes**: The `/api/workout-history` routes handle saving and loading workout history
3. **User Association**: Each workout is associated with a Whop user ID (`user_id` field)
4. **Automatic Saving**: When a user generates workouts, they're automatically saved to Supabase
5. **History Loading**: When the app loads, it fetches the user's workout history from Supabase

## Step 4: Testing

1. Start your dev server: `pnpm dev`
2. Generate some workouts in the app
3. Check your Supabase dashboard → Table Editor → `workout_history` to see the saved data
4. Refresh the app - your history should load automatically

## Troubleshooting

**History not saving?**
- Check the browser console for errors
- Verify the database table was created correctly
- Ensure environment variables are set correctly

**History not loading?**
- Check the Network tab in browser dev tools for API errors
- Verify the user is authenticated with Whop
- Check Supabase logs in the dashboard

**Database errors?**
- Make sure you've run the migration SQL
- Check that Row Level Security (RLS) is configured correctly
- Verify your Supabase project is active

