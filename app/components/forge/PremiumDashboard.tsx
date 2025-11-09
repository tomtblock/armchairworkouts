"use client";

import { useState, useEffect } from "react";
import type { WorkoutAnalytics } from "@/app/api/workout-analytics/route";

export default function PremiumDashboard() {
	const [analytics, setAnalytics] = useState<WorkoutAnalytics | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadAnalytics();
	}, []);

	const loadAnalytics = async () => {
		try {
			const response = await fetch("/api/workout-analytics");
			if (response.ok) {
				const data = await response.json();
				setAnalytics(data);
			}
		} catch (error) {
			console.error("Failed to load analytics:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="p-6 text-center">
				<p className="text-[#00FFFF]">Loading analytics...</p>
			</div>
		);
	}

	if (!analytics) {
		return (
			<div className="p-6 text-center">
				<p className="text-[#00FFFF]">No analytics data available</p>
			</div>
		);
	}

	const topExercises = Object.entries(analytics.exercisesCompleted)
		.sort((a, b) => b[1].count - a[1].count)
		.slice(0, 10);

	return (
		<div className="p-6 space-y-6">
			<h2 className="text-3xl font-bold text-[#00FFFF] mb-6">Workout Analytics</h2>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="border border-[#00FFFF] rounded-lg p-4 bg-black/50">
					<div className="text-[#00FFFF] text-sm mb-1">Total Workouts</div>
					<div className="text-3xl font-bold text-white">{analytics.totalWorkouts}</div>
				</div>
				<div className="border border-[#00FFFF] rounded-lg p-4 bg-black/50">
					<div className="text-[#00FFFF] text-sm mb-1">Total Sets</div>
					<div className="text-3xl font-bold text-white">{analytics.totalSets}</div>
				</div>
				<div className="border border-[#00FFFF] rounded-lg p-4 bg-black/50">
					<div className="text-[#00FFFF] text-sm mb-1">Total Reps</div>
					<div className="text-3xl font-bold text-white">{analytics.totalReps}</div>
				</div>
			</div>

			{/* Top Exercises */}
			<div className="border border-[#00FFFF] rounded-lg p-4 bg-black/50">
				<h3 className="text-xl font-bold text-[#00FFFF] mb-4">Top Exercises</h3>
				<div className="space-y-2">
					{topExercises.map(([exercise, stats]) => (
						<div key={exercise} className="flex justify-between items-center p-2 bg-black/30 rounded">
							<div>
								<div className="text-white font-semibold">{exercise}</div>
								<div className="text-gray-400 text-sm">
									{stats.count} workouts • {stats.totalSets} sets • {stats.totalReps} reps
								</div>
							</div>
							{stats.lastCompleted && (
								<div className="text-gray-400 text-xs">
									{new Date(stats.lastCompleted).toLocaleDateString()}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Workouts by Type */}
			<div className="border border-[#00FFFF] rounded-lg p-4 bg-black/50">
				<h3 className="text-xl font-bold text-[#00FFFF] mb-4">Workouts by Category</h3>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
					{Object.entries(analytics.workoutsByType).map(([type, count]) => (
						<div key={type} className="p-2 bg-black/30 rounded text-center">
							<div className="text-white font-semibold">{type}</div>
							<div className="text-[#00FFFF]">{count}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

