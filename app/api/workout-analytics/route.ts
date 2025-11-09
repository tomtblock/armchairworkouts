import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { checkUserSubscription } from "@/app/api/subscription/check";

export interface WorkoutAnalytics {
	totalWorkouts: number;
	totalSets: number;
	totalReps: number;
	exercisesCompleted: Record<string, {
		count: number;
		totalSets: number;
		totalReps: number;
		lastCompleted: string | null;
	}>;
	workoutsByDate: Record<string, number>;
	workoutsByType: Record<string, number>;
}

export async function GET(request: NextRequest) {
	try {
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);

		// Check if user has analytics access (premium)
		const subscription = await checkUserSubscription(userId, headersList);
		if (!subscription.hasAnalytics) {
			return NextResponse.json(
				{ error: "Analytics requires Premium subscription" },
				{ status: 403 }
			);
		}

		// Fetch all workout history for the user
		const { data, error } = await supabaseAdmin
			.from("workout_history")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Supabase error:", error);
			return NextResponse.json(
				{ error: "Failed to fetch workout history" },
				{ status: 500 }
			);
		}

		const workouts = data || [];

		// Calculate analytics
		const analytics: WorkoutAnalytics = {
			totalWorkouts: workouts.length,
			totalSets: workouts.reduce((sum, w) => sum + (w.sets || 0), 0),
			totalReps: workouts.reduce((sum, w) => sum + (typeof w.amount === "number" ? w.amount : 0), 0),
			exercisesCompleted: {},
			workoutsByDate: {},
			workoutsByType: {},
		};

		// Process each workout
		workouts.forEach((workout) => {
			const exercise = workout.workout;
			const date = new Date(workout.created_at).toISOString().split("T")[0];
			const type = workout.type || "Unknown";

			// Exercise stats
			if (!analytics.exercisesCompleted[exercise]) {
				analytics.exercisesCompleted[exercise] = {
					count: 0,
					totalSets: 0,
					totalReps: 0,
					lastCompleted: null,
				};
			}
			analytics.exercisesCompleted[exercise].count++;
			analytics.exercisesCompleted[exercise].totalSets += workout.sets || 0;
			analytics.exercisesCompleted[exercise].totalReps += typeof workout.amount === "number" ? workout.amount : 0;
			const workoutDate = new Date(workout.created_at);
			if (!analytics.exercisesCompleted[exercise].lastCompleted || 
			    workoutDate > new Date(analytics.exercisesCompleted[exercise].lastCompleted!)) {
				analytics.exercisesCompleted[exercise].lastCompleted = workout.created_at;
			}

			// Date stats
			analytics.workoutsByDate[date] = (analytics.workoutsByDate[date] || 0) + 1;

			// Type stats
			analytics.workoutsByType[type] = (analytics.workoutsByType[type] || 0) + 1;
		});

		return NextResponse.json(analytics);
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 401 }
		);
	}
}

