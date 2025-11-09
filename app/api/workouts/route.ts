import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

interface WorkoutItem {
	category: string;
	exercise: string;
	difficulty: string;
	durationType: string;
	description: string;
}

// Default workout list (fallback)
const DEFAULT_WORKOUTS: WorkoutItem[] = [
	{ category: "Upper Body (Push)", exercise: "Push-ups", difficulty: "All Levels", durationType: "Reps", description: "Place your hands under your shoulders, lower your chest toward the floor while keeping your body straight, then push back up." },
	{ category: "Upper Body (Pull & Posture)", exercise: "Pull-ups", difficulty: "All Levels", durationType: "Reps", description: "Hang from a bar and pull your body up until your chin clears the bar." },
	{ category: "Lower Body", exercise: "Squats", difficulty: "All Levels", durationType: "Reps", description: "Stand with feet shoulder-width apart, lower your hips back and down, keeping your chest up and knees in line with your toes." },
	{ category: "Full Body", exercise: "Burpees", difficulty: "All Levels", durationType: "Reps", description: "From standing, squat down, place your hands on the floor, step or jump back to plank, then return to stand." },
	{ category: "Core", exercise: "Plank", difficulty: "All Levels", durationType: "minutes", description: "Keep your elbows under shoulders and body in a straight line, squeezing your glutes and bracing your core." },
];

export async function GET() {
	try {
		// First, try to read from local CSV file
		try {
			const csvPath = join(process.cwd(), "data", "bodyweight_workouts_500_trainer.csv");
			const csvText = await readFile(csvPath, "utf-8");
			
			// Parse CSV - extract all columns
			const lines = csvText.split("\n").filter(line => line.trim().length > 0);
			const workouts: WorkoutItem[] = lines
				.slice(1) // Skip header row
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
				return NextResponse.json({ workouts });
			}
		} catch (localError) {
			console.error("Failed to read local CSV file:", localError);
			// Fall through to Google Sheets or default
		}

		// Fallback: Check if Google Sheets URL is provided in environment
		const sheetsUrl = process.env.GOOGLE_SHEETS_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;

		if (sheetsUrl) {
			try {
				// Fetch from Google Sheets (CSV format)
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
						return NextResponse.json({ workouts });
					}
				}
			} catch (error) {
				console.error("Failed to fetch from Google Sheets:", error);
				// Fall through to default workouts
			}
		}

		// Return default workouts as final fallback
		return NextResponse.json({ workouts: DEFAULT_WORKOUTS });
	} catch (error) {
		console.error("Error in workouts API:", error);
		return NextResponse.json(
			{ workouts: DEFAULT_WORKOUTS },
			{ status: 200 }
		);
	}
}

