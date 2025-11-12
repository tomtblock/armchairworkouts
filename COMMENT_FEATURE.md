# Comment Feature Setup

## Database Migration

To enable comments on workouts, you need to add the `user_comment` column to your `workout_history` table in Supabase.

### Steps:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migration SQL from `supabase-comment-migration.sql`:

```sql
ALTER TABLE workout_history 
ADD COLUMN IF NOT EXISTS user_comment TEXT;

CREATE INDEX IF NOT EXISTS idx_workout_history_user_comment 
ON workout_history(user_comment) WHERE user_comment IS NOT NULL;
```

## Features

- ✅ Users can add comments to saved workouts
- ✅ Comments are displayed in the workout history dashboard
- ✅ Users can edit existing comments
- ✅ Comments are saved to Supabase database
- ✅ Only Premium users (or test mode) can add comments
- ✅ UI matches the app's cyberpunk/terminal theme

## How It Works

1. **Viewing Comments**: Comments appear below each workout in the timeline view
2. **Adding Comments**: Click "ADD" button next to a workout to add a comment
3. **Editing Comments**: Click "EDIT" button to modify an existing comment
4. **Saving**: Click "SAVE" to save your comment, or "CANCEL" to discard changes

## API Endpoint

- **PATCH** `/api/workout-history/comment`
  - Body: `{ workoutId: string, comment: string | null }`
  - Updates the comment for a specific workout
  - Requires Premium subscription (or test mode)

