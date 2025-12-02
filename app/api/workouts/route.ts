import { NextResponse } from "next/server";

interface WorkoutItem {
	category: string;
	exercise: string;
	difficulty: string;
	durationType: string;
	description: string;
}

// Comprehensive default workout list - used when CSV is not available
const DEFAULT_WORKOUTS: WorkoutItem[] = [
	// Upper Body (Push)
	{ category: "Upper Body (Push)", exercise: "Push-ups", difficulty: "All Levels", durationType: "Reps", description: "Place your hands under your shoulders, lower your chest toward the floor while keeping your body straight, then push back up." },
	{ category: "Upper Body (Push)", exercise: "Diamond Push-ups", difficulty: "Intermediate", durationType: "Reps", description: "Form a diamond shape with your hands under your chest, then perform push-ups to target triceps." },
	{ category: "Upper Body (Push)", exercise: "Wide Push-ups", difficulty: "All Levels", durationType: "Reps", description: "Place hands wider than shoulder-width apart to emphasize chest muscles." },
	{ category: "Upper Body (Push)", exercise: "Pike Push-ups", difficulty: "Intermediate", durationType: "Reps", description: "Start in a pike position with hips high, lower your head toward the ground to target shoulders." },
	{ category: "Upper Body (Push)", exercise: "Decline Push-ups", difficulty: "Intermediate", durationType: "Reps", description: "Place feet on an elevated surface and perform push-ups to increase difficulty." },
	
	// Upper Body (Pull & Posture)
	{ category: "Upper Body (Pull & Posture)", exercise: "Pull-ups", difficulty: "Advanced", durationType: "Reps", description: "Hang from a bar and pull your body up until your chin clears the bar." },
	{ category: "Upper Body (Pull & Posture)", exercise: "Inverted Rows", difficulty: "All Levels", durationType: "Reps", description: "Lie under a bar, grip it with both hands, and pull your chest up to the bar." },
	{ category: "Upper Body (Pull & Posture)", exercise: "Superman Hold", difficulty: "All Levels", durationType: "seconds", description: "Lie face down and simultaneously lift arms and legs off the ground." },
	{ category: "Upper Body (Pull & Posture)", exercise: "Reverse Snow Angels", difficulty: "All Levels", durationType: "Reps", description: "Lie face down and move arms from sides to overhead while keeping them off the ground." },
	
	// Lower Body
	{ category: "Lower Body", exercise: "Squats", difficulty: "All Levels", durationType: "Reps", description: "Stand with feet shoulder-width apart, lower your hips back and down, keeping your chest up and knees in line with your toes." },
	{ category: "Lower Body", exercise: "Lunges", difficulty: "All Levels", durationType: "Reps", description: "Step forward and lower your body until both knees are at 90 degrees, then push back up." },
	{ category: "Lower Body", exercise: "Bulgarian Split Squats", difficulty: "Intermediate", durationType: "Reps", description: "Place rear foot on an elevated surface and perform single-leg squats." },
	{ category: "Lower Body", exercise: "Glute Bridges", difficulty: "All Levels", durationType: "Reps", description: "Lie on your back with knees bent, lift your hips toward the ceiling, squeezing glutes at the top." },
	{ category: "Lower Body", exercise: "Calf Raises", difficulty: "All Levels", durationType: "Reps", description: "Stand on the edge of a step and raise up onto your toes, then lower back down." },
	{ category: "Lower Body", exercise: "Wall Sit", difficulty: "All Levels", durationType: "seconds", description: "Sit against a wall with thighs parallel to the ground and hold the position." },
	
	// Core
	{ category: "Core", exercise: "Plank", difficulty: "All Levels", durationType: "seconds", description: "Keep your elbows under shoulders and body in a straight line, squeezing your glutes and bracing your core." },
	{ category: "Core", exercise: "Dead Bug", difficulty: "All Levels", durationType: "Reps", description: "Lie on your back, extend opposite arm and leg while keeping your lower back pressed to the floor." },
	{ category: "Core", exercise: "Mountain Climbers", difficulty: "All Levels", durationType: "Reps", description: "In a plank position, drive knees toward chest alternately in a running motion." },
	{ category: "Core", exercise: "Bicycle Crunches", difficulty: "All Levels", durationType: "Reps", description: "Lie on your back, bring opposite elbow to knee while extending the other leg." },
	{ category: "Core", exercise: "Russian Twists", difficulty: "Intermediate", durationType: "Reps", description: "Sit with feet off the ground, rotate your torso side to side while holding a weight or clasping hands." },
	{ category: "Core", exercise: "Leg Raises", difficulty: "Intermediate", durationType: "Reps", description: "Lie flat and raise your legs to 90 degrees, then lower them slowly without touching the ground." },
	
	// Full Body
	{ category: "Full Body", exercise: "Burpees", difficulty: "All Levels", durationType: "Reps", description: "From standing, squat down, place your hands on the floor, step or jump back to plank, then return to stand." },
	{ category: "Full Body", exercise: "Jumping Jacks", difficulty: "All Levels", durationType: "Reps", description: "Jump while spreading legs and raising arms overhead, then return to starting position." },
	{ category: "Full Body", exercise: "High Knees", difficulty: "All Levels", durationType: "seconds", description: "Run in place while driving knees up toward chest as high as possible." },
	{ category: "Full Body", exercise: "Bear Crawl", difficulty: "Intermediate", durationType: "seconds", description: "Move forward on hands and feet with knees hovering just above the ground." },
	{ category: "Full Body", exercise: "Inchworm", difficulty: "All Levels", durationType: "Reps", description: "From standing, bend forward and walk hands out to plank, then walk feet toward hands and stand." },
];

export async function GET() {
	console.log("[/api/workouts] Loading workouts...");
	
	try {
		// In serverless environments (like Netlify), filesystem access may not work
		// So we primarily rely on the default workouts or Google Sheets
		
		// Check if Google Sheets URL is provided in environment
		const sheetsUrl = process.env.GOOGLE_SHEETS_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;

		if (sheetsUrl) {
			try {
				console.log("[/api/workouts] Fetching from Google Sheets...");
				const response = await fetch(sheetsUrl, {
					next: { revalidate: 86400 }, // Cache for 24 hours
				});

				if (response.ok) {
					const csvText = await response.text();
					const lines = csvText.split("\n").filter(line => line.trim().length > 0);
					const workouts: WorkoutItem[] = lines
						.slice(1)
						.map((line) => {
							// Parse CSV line - handle quoted values
							const columns: string[] = [];
							let current = "";
							let inQuotes = false;
							
							for (let i = 0; i < line.length; i++) {
								const char = line[i];
								if (char === '"') {
									inQuotes = !inQuotes;
								} else if (char === ',' && !inQuotes) {
									columns.push(current.trim());
									current = "";
								} else {
									current += char;
								}
							}
							columns.push(current.trim()); // Add last column
							
							if (columns.length >= 5) {
								return {
									category: columns[0]?.trim() || "",
									exercise: columns[1]?.trim() || "",
									difficulty: columns[2]?.trim() || "",
									durationType: columns[3]?.trim() || "",
									description: columns[4]?.trim() || "",
								};
							}
							return null;
						})
						.filter((workout): workout is WorkoutItem => workout !== null && workout.exercise.length > 0);

					if (workouts.length > 0) {
						console.log(`[/api/workouts] Loaded ${workouts.length} workouts from Google Sheets`);
						return NextResponse.json({ workouts });
					}
				}
			} catch (error) {
				console.error("[/api/workouts] Failed to fetch from Google Sheets:", error);
				// Fall through to default workouts
			}
		}

		// Return comprehensive default workouts
		console.log(`[/api/workouts] Using ${DEFAULT_WORKOUTS.length} default workouts`);
		return NextResponse.json({ workouts: DEFAULT_WORKOUTS });
	} catch (error) {
		console.error("[/api/workouts] Error:", error);
		return NextResponse.json(
			{ workouts: DEFAULT_WORKOUTS },
			{ status: 200 }
		);
	}
}

