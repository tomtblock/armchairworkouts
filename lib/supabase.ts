import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eymckbippqdhyztqybgws.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bWNrYmlwcWRoeXp0cXliZ3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1Mzg5MjAsImV4cCI6MjA3ODExNDkyMH0.lofpIx9wHex4XbV6jx-uKLh-hePQZwV1wVzDYGa0PGw";

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bWNrYmlwcWRoeXp0cXliZ3dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUzODkyMCwiZXhwIjoyMDc4MTE0OTIwfQ.MVpceOZaVRtFx6HixJsImjx3SzfuZ8D4AILN9Tgs238";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

