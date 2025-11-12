-- Add comment column to workout_history table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE workout_history 
ADD COLUMN IF NOT EXISTS user_comment TEXT;

-- Create index for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_workout_history_user_comment ON workout_history(user_comment) WHERE user_comment IS NOT NULL;

