-- =====================================================
-- ARMCHAIR WORKOUTS - SUPABASE MIGRATION
-- Run this SQL in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard → SQL Editor
-- =====================================================

-- 1. Create user_subscriptions table (tracks all users with subscriptions)
CREATE TABLE IF NOT EXISTS user_subscriptions (
    user_id TEXT PRIMARY KEY,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'standard', 'premium')),
    free_spins_remaining INTEGER DEFAULT 3,
    whop_membership_id TEXT,
    whop_product_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add missing columns to workout_history (if they don't exist)
DO $$ 
BEGIN
    -- Add 'saved' column to differentiate saved vs completed workouts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_history' AND column_name = 'saved') THEN
        ALTER TABLE workout_history ADD COLUMN saved BOOLEAN DEFAULT false;
    END IF;
    
    -- Add 'user_comment' column for workout notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_history' AND column_name = 'user_comment') THEN
        ALTER TABLE workout_history ADD COLUMN user_comment TEXT;
    END IF;
    
    -- Add 'completed_at' column to track when workout was done
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_history' AND column_name = 'completed_at') THEN
        ALTER TABLE workout_history ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_history_created_at ON workout_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_history_saved ON workout_history(saved);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);

-- 4. Enable Row Level Security (RLS) for user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_subscriptions
-- Allow service role to do everything
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON user_subscriptions;
CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Create RLS policies for workout_history (if not exists)
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all workouts" ON workout_history;
CREATE POLICY "Service role can manage all workouts" ON workout_history
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 7. Create function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for user_subscriptions
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES (run these to verify setup)
-- =====================================================

-- Check user_subscriptions table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- Check workout_history table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'workout_history'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS! Your database is now ready.
-- =====================================================

