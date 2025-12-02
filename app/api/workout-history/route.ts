import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import type { WorkoutResult } from "@/app/lib/workoutRandomizer";

// Check if test mode is enabled via env var or cookie
function isTestModeEnabled(request: NextRequest): boolean {
	if (process.env.ENABLE_TEST_MODE === "true" || process.env.TEST_MODE_ENABLED === "true") {
		return true;
	}
	const testModeCookie = request.cookies.get("armchair-test-mode")?.value;
	return testModeCookie === "premium" || testModeCookie === "standard";
}

// GET - Fetch workout history for the authenticated user
export async function GET(request: NextRequest) {
	try {
		// Verify user is authenticated with Whop
		const headersList = await headers();
		let userId: string | null = null;
		let isDemo = false;

		try {
			const result = await whopsdk.verifyUserToken(headersList);
			userId = result.userId;
			console.log("✅ User authenticated for workout history:", userId);
		} catch (authError) {
			console.warn("⚠️ Auth failed for workout history, using demo mode:", authError);
			isDemo = true;
		}

		// If in demo mode, return empty history (client will use localStorage in test mode)
		if (isDemo || !userId) {
			const testMode = isTestModeEnabled(request);
			console.log(testMode ? "🧪 Test mode: check localStorage for history" : "📍 Demo mode: returning empty workout history");
			return NextResponse.json({ 
				history: [],
				demo: true,
				testMode,
				useLocalStorage: testMode,
				message: testMode 
					? "Test mode - check localStorage for workout history"
					: "Demo mode - connect through Whop to see saved workouts."
			});
		}

		// Check subscription - only Premium users can view history (or test mode)
		const { checkUserSubscription } = await import("@/app/api/subscription/check");
		const subscription = await checkUserSubscription(userId, headersList);
		
		// Allow access in test mode (env var or cookie) or if user has storage (Standard or Premium)
		const TEST_MODE = isTestModeEnabled(request);
		if (!subscription.hasStorage && !TEST_MODE) {
			return NextResponse.json(
				{ 
					error: "Storage not available",
					message: "Upgrade to Standard or Premium to view workout history.",
					requiresUpgrade: true
				},
				{ status: 403 }
			);
		}

		// Fetch workout history from Supabase (all workouts for Premium users)
		const { data, error } = await supabaseAdmin
			.from("workout_history")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Supabase error:", error);
			// Check if it's a "table doesn't exist" error
			const isTableMissing = error.message?.includes("does not exist") || 
			                      error.message?.includes("relation") ||
			                      error.code === "42P01";
			
			return NextResponse.json(
				{ 
					error: isTableMissing 
						? "Database table not found. Please create the 'workout_history' table in Supabase."
						: "Failed to fetch workout history", 
					details: error.message,
					code: error.code,
					hint: isTableMissing ? "See QUICK_FIX.md or SUPABASE_SETUP.md for setup instructions" : undefined
				},
				{ status: 500 }
			);
		}

		// Convert database records to WorkoutResult format with dates
		const history = (data || []).map((record: any) => ({
			sets: record.sets,
			workout: record.workout,
			amount: record.amount,
			repsTime: record.reps_time,
			type: record.type,
			description: record.description || undefined,
			userComment: record.user_comment || undefined,
			saved: record.saved || false, // true = saved collection, false = completed workout
			completedAt: record.completed_at || undefined,
			createdAt: record.created_at,
			id: record.id,
		}));

		return NextResponse.json({ history });
	} catch (error) {
		console.error("Error fetching workout history:", error);
		// Return empty history instead of error for better UX
		return NextResponse.json({ 
			history: [],
			demo: true,
			message: "Could not fetch workout history"
		});
	}
}

// POST - Save workout history for the authenticated user
export async function POST(request: NextRequest) {
	// Check test mode FIRST before anything else
	const testMode = isTestModeEnabled(request);
	
	// Parse the request body early so we can use it in any response
	let workouts: any[] = [];
	try {
		const body = await request.json();
		workouts = body.workouts || [];
	} catch (parseError) {
		console.error("❌ Failed to parse request body:", parseError);
		return NextResponse.json({ 
			error: "Invalid request body",
			message: "Could not parse workout data",
			success: false
		}, { status: 400 });
	}

	// In test mode, skip authentication entirely and just save locally
	if (testMode) {
		console.log("🧪 Test mode: workout save simulated for", workouts.length, "workout(s)");
		return NextResponse.json({ 
			success: true,
			demo: true,
			testMode: true,
			saved: workouts.length,
			message: "Test mode - workouts saved locally",
			workouts: workouts.map((w: any, i: number) => ({ ...w, id: `local-${Date.now()}-${i}` }))
		});
	}

	try {
		// Verify user is authenticated with Whop
		const headersList = await headers();
		let userId: string | null = null;
		let isDemo = false;
		
		try {
			const result = await whopsdk.verifyUserToken(headersList);
			userId = result.userId;
			console.log("✅ User authenticated for saving workout:", userId);
		} catch (authError) {
			console.warn("⚠️ Auth failed for workout save, using demo mode:", authError);
			isDemo = true;
		}

		// If in demo mode, just simulate success
		if (isDemo || !userId) {
			console.log("📍 Demo mode: workout save simulated");
			return NextResponse.json({ 
				success: true,
				demo: true,
				testMode: false,
				saved: workouts.length,
				message: "Demo mode - workout not saved. Add ?testmode=premium to URL to enable test mode.",
				workouts: workouts.map((w: any, i: number) => ({ ...w, id: `local-${Date.now()}-${i}` }))
			});
		}

		// Check subscription status - only premium users can save
		// Import subscription check logic
		const { checkUserSubscription } = await import("@/app/api/subscription/check");
		const subscription = await checkUserSubscription(userId, headersList);
		
		// Only Premium users can save workouts
		if (!subscription.hasStorage) {
			return NextResponse.json(
				{ 
					error: "Storage not available",
					message: "Upgrade to Premium to save workouts.",
					requiresUpgrade: true
				},
				{ status: 403 }
			);
		}

		// Validate workouts array (already parsed earlier)
		if (!Array.isArray(workouts) || workouts.length === 0) {
			console.error("Invalid workout data: not an array or empty", { workouts });
			return NextResponse.json(
				{ error: "Invalid workout data", message: "Workouts array is required and must not be empty" },
				{ status: 400 }
			);
		}

		// Validate and convert WorkoutResult to database format
		const records = (workouts as WorkoutResult[]).map((workout: any, idx) => {
			// Validate required fields
			if (!workout.workout || workout.sets === undefined || workout.amount === undefined || !workout.repsTime || !workout.type) {
				console.error(`Invalid workout at index ${idx}:`, workout);
				throw new Error(`Invalid workout data at index ${idx}: missing required fields`);
			}

			return {
				user_id: userId,
				sets: Number(workout.sets) || 0,
				workout: String(workout.workout).trim(),
				amount: typeof workout.amount === "string" ? parseInt(workout.amount) || 0 : Number(workout.amount) || 0,
				reps_time: String(workout.repsTime).trim(),
				type: String(workout.type).trim(),
				description: workout.description ? String(workout.description).trim() : null,
				saved: workout.saved === true, // true = saved to collection, false = completed workout
				user_comment: workout.userComment ? String(workout.userComment).trim() : null,
				completed_at: workout.completedAt ? new Date(workout.completedAt).toISOString() : null,
			};
		});

		console.log(`Saving ${records.length} workout(s) for user ${userId}`);

		// Insert new workouts
		const { data, error } = await supabaseAdmin
			.from("workout_history")
			.insert(records)
			.select();

		if (error) {
			console.error("❌ Supabase error:", {
				message: error.message,
				code: error.code,
				details: error.details,
				hint: error.hint,
				records: records.length
			});
			
			// Check if it's a "table doesn't exist" error
			const isTableMissing = error.message?.includes("does not exist") || 
			                      error.message?.includes("relation") ||
			                      error.code === "42P01";
			
			return NextResponse.json(
				{ 
					error: isTableMissing 
						? "Database table not found. Please create the 'workout_history' table in Supabase."
						: "Failed to save workout history", 
					message: isTableMissing 
						? "The workout_history table does not exist. Please run the migration SQL in Supabase."
						: error.message || "Database error occurred",
					details: error.message,
					code: error.code,
					hint: isTableMissing ? "See QUICK_FIX.md or SUPABASE_SETUP.md for setup instructions" : error.hint
				},
				{ status: 500 }
			);
		}

		console.log(`✅ Successfully saved ${data?.length || 0} workout(s) to database`);
		return NextResponse.json({ 
			success: true, 
			saved: data?.length || 0,
			workouts: data || []
		});
	} catch (error) {
		console.error("Error saving workout history:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ 
				error: error instanceof Error && error.message.includes("verifyUserToken") 
					? "Authentication failed" 
					: "Failed to save workout history",
				details: errorMessage 
			},
			{ status: error instanceof Error && error.message.includes("verifyUserToken") ? 401 : 500 }
		);
	}
}

