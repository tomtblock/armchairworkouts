# Quick Fix: Supabase Table Setup

## The Error
You're seeing "Failed to save history to Supabase" because the database table doesn't exist yet.

## Solution: Create the Table

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project (ref: `eymckbippqdhyztqybgws`)

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run this SQL:**
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

4. **Click "Run"** (or press Cmd/Ctrl + Enter)

5. **Verify it worked:**
   - Go to "Table Editor" in the left sidebar
   - You should see `workout_history` in the list

6. **Refresh your app** - the error should be gone!

## Alternative: Check Server Logs

If you still see errors, check the terminal where `pnpm dev` is running. Look for messages like:
- "relation 'workout_history' does not exist" (table doesn't exist)
- "permission denied" (RLS policy issue)
- Other Supabase errors

The app will continue to work with localStorage as a fallback until the table is created.

