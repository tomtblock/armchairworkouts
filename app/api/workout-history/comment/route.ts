import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

// PATCH - Update comment for a specific workout
export async function PATCH(request: NextRequest) {
	try {
		// Verify user is authenticated with Whop
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);

		// Check subscription - only Premium users can add comments (or test mode)
		const { checkUserSubscription } = await import("@/app/api/subscription/check");
		const subscription = await checkUserSubscription(userId, headersList);
		
		const TEST_MODE = process.env.ENABLE_TEST_MODE === "true" || process.env.TEST_MODE_ENABLED === "true";
		if (!subscription.hasStorage && !TEST_MODE) {
			return NextResponse.json(
				{ 
					error: "Storage not available",
					message: "Only Premium subscribers can add comments to workouts.",
					requiresUpgrade: true
				},
				{ status: 403 }
			);
		}

		// Parse request body
		const body = await request.json();
		const { workoutId, comment } = body;

		if (!workoutId) {
			return NextResponse.json(
				{ error: "Workout ID is required" },
				{ status: 400 }
			);
		}

		// Update the workout comment
		const { data, error } = await supabaseAdmin
			.from("workout_history")
			.update({ user_comment: comment || null })
			.eq("id", workoutId)
			.eq("user_id", userId) // Ensure user can only update their own workouts
			.select()
			.single();

		if (error) {
			console.error("Supabase error:", error);
			return NextResponse.json(
				{ 
					error: "Failed to update comment",
					details: error.message,
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, workout: data });
	} catch (error) {
		console.error("Error updating comment:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ 
				error: error instanceof Error && error.message.includes("verifyUserToken") 
					? "Authentication failed" 
					: "Failed to update comment",
				details: errorMessage 
			},
			{ status: error instanceof Error && error.message.includes("verifyUserToken") ? 401 : 500 }
		);
	}
}

