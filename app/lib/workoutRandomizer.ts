export interface WorkoutResult {
	sets: number;
	workout: string;
	amount: number | string;
	repsTime: string;
	type: string;
	description?: string;
}

export type WorkoutMode = "easy" | "standard" | "beast";

export interface WorkoutData {
	workouts: WorkoutItem[];
}

export interface WorkoutItem {
	category: string;
	exercise: string;
	difficulty: string;
	durationType: string;
	description: string;
}

// Default workout list if Google Sheets fails
const DEFAULT_WORKOUTS: WorkoutItem[] = [
	{ category: "Upper Body (Push)", exercise: "Push-ups", difficulty: "All Levels", durationType: "Reps", description: "Place your hands under your shoulders, lower your chest toward the floor while keeping your body straight, then push back up." },
	{ category: "Upper Body (Pull & Posture)", exercise: "Pull-ups", difficulty: "All Levels", durationType: "Reps", description: "Hang from a bar and pull your body up until your chin clears the bar." },
	{ category: "Lower Body", exercise: "Squats", difficulty: "All Levels", durationType: "Reps", description: "Stand with feet shoulder-width apart, lower your hips back and down, keeping your chest up and knees in line with your toes." },
	{ category: "Full Body", exercise: "Burpees", difficulty: "All Levels", durationType: "Reps", description: "From standing, squat down, place your hands on the floor, step or jump back to plank, then return to stand." },
	{ category: "Core", exercise: "Plank", difficulty: "All Levels", durationType: "minutes", description: "Keep your elbows under shoulders and body in a straight line, squeezing your glutes and bracing your core." },
];

export class WorkoutRandomizer {
	private workouts: WorkoutItem[] = [];
	private minSets: number = 1;
	private maxSets: number = 5;
	private minVolume: number = 1;
	private maxVolume: number = 5;
	private mode: WorkoutMode = "standard";
	private selectedCategories: string[] = [];

	constructor(workouts?: WorkoutItem[], minSets?: number, maxSets?: number, minVolume?: number, maxVolume?: number) {
		if (workouts && workouts.length > 0) {
			this.workouts = workouts;
		}
		if (minSets !== undefined) {
			this.minSets = minSets;
		}
		if (maxSets !== undefined) {
			this.maxSets = maxSets;
		}
		if (minVolume !== undefined) {
			this.minVolume = minVolume;
		}
		if (maxVolume !== undefined) {
			this.maxVolume = maxVolume;
		}
	}

	/**
	 * Update configuration
	 */
	updateConfig(minSets: number, maxSets: number, minVolume: number, maxVolume: number, mode?: WorkoutMode, selectedCategories?: string[]) {
		this.minSets = minSets;
		this.maxSets = maxSets;
		this.minVolume = minVolume;
		this.maxVolume = maxVolume;
		if (mode) {
			this.mode = mode;
		}
		if (selectedCategories) {
			this.selectedCategories = selectedCategories;
		}
	}

	/**
	 * Get filtered workouts based on mode and selected categories
	 */
	private getFilteredWorkouts(): WorkoutItem[] {
		let filtered = [...this.workouts];

		// Filter by difficulty mode
		if (this.mode === "easy") {
			// Easy mode: Only "All Levels" or "Beginner" workouts
			filtered = filtered.filter(w => 
				w.difficulty === "All Levels" || 
				w.difficulty.toLowerCase().includes("beginner") ||
				w.difficulty.toLowerCase().includes("easy")
			);
		} else if (this.mode === "beast") {
			// Beast mode: Only "All Levels" or "Advanced" workouts
			filtered = filtered.filter(w => 
				w.difficulty === "All Levels" || 
				w.difficulty.toLowerCase().includes("advanced") ||
				w.difficulty.toLowerCase().includes("hard") ||
				w.difficulty.toLowerCase().includes("expert")
			);
		}
		// Standard mode: All workouts (no filtering by difficulty)

		// Filter by selected categories
		if (this.selectedCategories.length > 0) {
			filtered = filtered.filter(w => this.selectedCategories.includes(w.category));
		}

		return filtered.length > 0 ? filtered : this.workouts;
	}

	/**
	 * Generate a random workout combination
	 */
	generate(minSets: number, maxSets: number, minVolume: number, maxVolume: number): WorkoutResult {
		const filteredWorkouts = this.getFilteredWorkouts();
		
		if (filteredWorkouts.length === 0) {
			// Fallback if no workouts match filters
			return {
				sets: 1,
				workout: "No workouts available",
				amount: 1,
				repsTime: "Reps",
				type: "N/A",
			};
		}

		// Select random workout from filtered list
		const workoutItem = this.randomItem(filteredWorkouts);
		
		// Sets = random between minSets and maxSets
		const sets = this.randomInt(minSets, maxSets);
		
		// Volume = random between minVolume and maxVolume
		const amount = this.randomInt(minVolume, maxVolume);
		
		// Reps/Time = from Duration Type column (Reps or minutes)
		const repsTime = workoutItem.durationType;
		
		// Type = Category from CSV
		const type = workoutItem.category;

		return {
			sets,
			workout: workoutItem.exercise,
			amount,
			repsTime,
			type,
			description: workoutItem.description,
		};
	}

	/**
	 * Generate multiple workout combinations
	 */
	generateMultiple(count: number, minSets: number, maxSets: number, minVolume: number, maxVolume: number): WorkoutResult[] {
		return Array.from({ length: count }, () => this.generate(minSets, maxSets, minVolume, maxVolume));
	}

	/**
	 * Update the workout list from external source
	 */
	updateWorkouts(workouts: WorkoutItem[]) {
		if (workouts && workouts.length > 0) {
			this.workouts = workouts;
		}
	}

	/**
	 * Get all available categories
	 */
	getAvailableCategories(): string[] {
		const categories = new Set(this.workouts.map(w => w.category));
		return Array.from(categories).sort();
	}

	private randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	private randomItem<T>(array: T[]): T {
		return array[Math.floor(Math.random() * array.length)];
	}
}

