import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import type { WorkoutResult } from "@/app/lib/workoutRandomizer";

// GET - Fetch workout history for the authenticated user
export async function GET(request: NextRequest) {
	try {
		// Verify user is authenticated with Whop
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);

		// Check subscription - only Premium users can view history (or test mode)
		const { checkUserSubscription } = await import("@/app/api/subscription/check");
		const subscription = await checkUserSubscription(userId, headersList);
		
		// Allow access in test mode or if user has storage
		const TEST_MODE = process.env.ENABLE_TEST_MODE === "true" || process.env.TEST_MODE_ENABLED === "true";
		if (!subscription.hasStorage && !TEST_MODE) {
			return NextResponse.json(
				{ 
					error: "Storage not available",
					message: "Only Premium subscribers can view workout history. Upgrade to Premium for storage and analytics.",
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
		const history = (data || []).map((record) => ({
			sets: record.sets,
			workout: record.workout,
			amount: record.amount,
			repsTime: record.reps_time,
			type: record.type,
			description: record.description || undefined,
			userComment: (record as any).user_comment || undefined,
			createdAt: record.created_at,
			id: record.id,
		}));

		return NextResponse.json({ history });
	} catch (error) {
		console.error("Error fetching workout history:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 401 }
		);
	}
}

// POST - Save workout history for the authenticated user
export async function POST(request: NextRequest) {
	try {
		// Verify user is authenticated with Whop
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);

		// Check subscription status - only premium users can save (or test mode)
		// Import subscription check logic
		const { checkUserSubscription } = await import("@/app/api/subscription/check");
		const subscription = await checkUserSubscription(userId, headersList);
		
		// Allow saving in test mode or if user has storage
		const TEST_MODE = process.env.ENABLE_TEST_MODE === "true" || process.env.TEST_MODE_ENABLED === "true";
		if (!subscription.hasStorage && !TEST_MODE) {
			return NextResponse.json(
				{ 
					error: "Storage not available",
					message: "Only Premium subscribers can save workout history. Upgrade to Premium for storage and analytics.",
					requiresUpgrade: true
				},
				{ status: 403 }
			);
		}

		// Parse request body
		const body = await request.json();
		const workouts: WorkoutResult[] = body.workouts;

		if (!Array.isArray(workouts) || workouts.length === 0) {
			return NextResponse.json(
				{ error: "Invalid workout data" },
				{ status: 400 }
			);
		}

		// Convert WorkoutResult to database format
		const records = workouts.map((workout) => ({
			user_id: userId,
			sets: workout.sets,
			workout: workout.workout,
			amount: typeof workout.amount === "string" ? parseInt(workout.amount) || workout.amount : workout.amount,
			reps_time: workout.repsTime,
			type: workout.type,
			description: workout.description || null,
		}));

		// Insert new workouts (upsert to handle duplicates)
		const { data, error } = await supabaseAdmin
			.from("workout_history")
			.insert(records)
			.select();

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
						: "Failed to save workout history", 
					details: error.message,
					code: error.code,
					hint: isTableMissing ? "See QUICK_FIX.md or SUPABASE_SETUP.md for setup instructions" : undefined
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, saved: data?.length || 0 });
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

