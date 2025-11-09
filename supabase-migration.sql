-- Create workout_history table in Supabase
-- Run this SQL in your Supabase SQL Editor

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

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_history_user_id ON workout_history(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_workout_history_created_at ON workout_history(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own history
-- Note: Since we're using service role key in the API, this is mainly for direct client access
CREATE POLICY "Users can read their own workout history"
  ON workout_history
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own history
CREATE POLICY "Users can insert their own workout history"
  ON workout_history
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Note: Since we're using Whop authentication and service role key in API routes,
-- the RLS policies above are for direct client access. The API routes bypass RLS
-- using the service role key, which is the recommended approach for server-side operations.

