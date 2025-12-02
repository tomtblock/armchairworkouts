"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { animate, stagger } from "@/lib/anime";
import type { SubscriptionStatus } from "@/app/api/subscription/route";

interface WorkoutHistoryItem {
	sets: number;
	workout: string;
	amount: number | string;
	repsTime: string;
	type: string;
	description?: string;
	userComment?: string;
	createdAt?: string;
	completedAt?: string;
	id: string;
	saved?: boolean;
}

interface WorkoutHistoryDashboardProps {
	isTestMode?: boolean;
	testModeTier?: string;
}

// Safe date formatting helper
const formatDate = (dateString?: string) => {
	if (!dateString) return { date: "Unknown", time: "—" };
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return { date: "Unknown", time: "—" };
		return {
			date: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
			time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
		};
	} catch {
		return { date: "Unknown", time: "—" };
	}
};

// Get workout type color
const getTypeColor = (type: string) => {
	const colors: Record<string, string> = {
		upper: "#00BFFF",
		lower: "#FF00FF",
		core: "#FFD700",
		cardio: "#FF4500",
		full: "#00FF7F",
	};
	return colors[type?.toLowerCase()] || "#00FFFF";
};

// Achievement badges
const ACHIEVEMENTS = [
	{ id: "first", name: "First Steps", desc: "Complete your first workout", icon: "🎯", requirement: 1 },
	{ id: "streak3", name: "Getting Started", desc: "Complete 3 workouts", icon: "🔥", requirement: 3 },
	{ id: "streak5", name: "On Fire", desc: "Complete 5 workouts", icon: "⚡", requirement: 5 },
	{ id: "streak10", name: "Unstoppable", desc: "Complete 10 workouts", icon: "💪", requirement: 10 },
	{ id: "streak25", name: "Beast Mode", desc: "Complete 25 workouts", icon: "🦁", requirement: 25 },
	{ id: "streak50", name: "Legend", desc: "Complete 50 workouts", icon: "👑", requirement: 50 },
];

export default function WorkoutHistoryDashboard({ isTestMode = false, testModeTier = "premium" }: WorkoutHistoryDashboardProps) {
	const router = useRouter();
	const [savedWorkouts, setSavedWorkouts] = useState<WorkoutHistoryItem[]>([]);
	const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutHistoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
	const [showConfetti, setShowConfetti] = useState(false);
	const completedRef = useRef<HTMLDivElement>(null);
	const statsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		loadHistory();
		loadSubscription();
		const interval = setInterval(loadHistory, 5000);
		return () => clearInterval(interval);
	}, []);

	// Animate stats when completed workouts change
	useEffect(() => {
		if (statsRef.current && completedWorkouts.length > 0) {
			animate(statsRef.current.querySelectorAll(".stat-item"), {
				scale: [0.8, 1.1, 1],
				opacity: [0, 1],
				duration: 500,
				delay: stagger(100),
			});
		}
	}, [completedWorkouts.length]);

	const loadHistory = async () => {
		try {
			// Load from localStorage (test mode)
			if (isTestMode && typeof window !== "undefined") {
				const localHistory = JSON.parse(localStorage.getItem("armchair-workout-history") || "[]");
				
				// Separate saved vs completed
				const saved = localHistory.filter((w: any) => w.saved === true);
				const completed = localHistory.filter((w: any) => w.completedAt || !w.saved);
				
				setSavedWorkouts(saved);
				setCompletedWorkouts(completed);
				setLoading(false);
				return;
			}

			// Try API
			const response = await fetch("/api/workout-history");
			if (response.ok) {
				const data = await response.json();
				let historyData = data.history || [];
				
				// Also check localStorage
				if (typeof window !== "undefined") {
					const localHistory = JSON.parse(localStorage.getItem("armchair-workout-history") || "[]");
					if (localHistory.length > 0) {
						const merged = [...localHistory, ...historyData];
						const seen = new Set();
						historyData = merged.filter((item: any) => {
							if (seen.has(item.id)) return false;
							seen.add(item.id);
							return true;
						});
					}
				}
				
				// Separate by type
				const saved = historyData.filter((w: any) => w.saved === true);
				const completed = historyData.filter((w: any) => w.completedAt || !w.saved);
				
				setSavedWorkouts(saved);
				setCompletedWorkouts(completed);
			}
		} catch (error) {
			console.error("Failed to load history:", error);
			// Fallback
			if (typeof window !== "undefined") {
				const localHistory = JSON.parse(localStorage.getItem("armchair-workout-history") || "[]");
				setCompletedWorkouts(localHistory);
			}
		} finally {
			setLoading(false);
		}
	};

	const loadSubscription = async () => {
		try {
			const response = await fetch("/api/subscription");
			if (response.ok) {
				const data = await response.json();
				setSubscription(data);
			}
		} catch (error) {
			console.error("Failed to load subscription:", error);
		}
	};

	// Random workout from saved collection
	const [randomWorkout, setRandomWorkout] = useState<WorkoutHistoryItem | null>(null);
	
	const pickRandomWorkout = () => {
		if (savedWorkouts.length === 0) return;
		
		const randomIndex = Math.floor(Math.random() * savedWorkouts.length);
		setRandomWorkout(savedWorkouts[randomIndex]);
		
		// Trigger confetti
		setShowConfetti(true);
		setTimeout(() => setShowConfetti(false), 1500);
		
		// Animate
		if (statsRef.current) {
			animate(statsRef.current, {
				scale: [1, 1.1, 1],
				rotate: [0, 5, -5, 0],
				duration: 500,
			});
		}
	};

	const getMostCommonExercise = () => {
		const counts: Record<string, number> = {};
		completedWorkouts.forEach(w => {
			counts[w.workout] = (counts[w.workout] || 0) + 1;
		});
		const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
		return sorted[0]?.[0] || "—";
	};

	const getMostCommonType = () => {
		const counts: Record<string, number> = {};
		completedWorkouts.forEach(w => {
			counts[w.type] = (counts[w.type] || 0) + 1;
		});
		const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
		return sorted[0]?.[0]?.toUpperCase() || "—";
	};

	const getWorkoutsToday = () => {
		const today = new Date().toDateString();
		return completedWorkouts.filter(w => {
			const d = w.completedAt || w.createdAt;
			return d && new Date(d).toDateString() === today;
		}).length;
	};

	const getWorkoutsThisWeek = () => {
		const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
		return completedWorkouts.filter(w => {
			const d = w.completedAt || w.createdAt;
			return d && new Date(d).getTime() > weekAgo;
		}).length;
	};

	// Get earned achievements
	const earnedAchievements = ACHIEVEMENTS.filter(a => completedWorkouts.length >= a.requirement);

	// Clear history (test mode only) - clears localStorage directly
	const clearHistory = () => {
		localStorage.removeItem("armchair-workout-history");
		setSavedWorkouts([]);
		setCompletedWorkouts([]);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					className="w-12 h-12 border-4 border-[#00FFFF] border-t-transparent rounded-full"
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white p-4 md:p-6">
			{/* Confetti Effect */}
			<AnimatePresence>
				{showConfetti && (
					<div className="fixed inset-0 pointer-events-none z-50">
						{[...Array(30)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute w-3 h-3 rounded-full"
								style={{
									left: `${Math.random() * 100}%`,
									top: -20,
									background: ["#00FFFF", "#FF00FF", "#FFD700", "#00FF00"][Math.floor(Math.random() * 4)],
								}}
								initial={{ y: -20, opacity: 1 }}
								animate={{ y: window.innerHeight + 20, opacity: 0, rotate: Math.random() * 360 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 1.5, delay: i * 0.02 }}
							/>
						))}
					</div>
				)}
			</AnimatePresence>

			{/* Header */}
			<div className="max-w-7xl mx-auto mb-6">
				<div className="flex items-center justify-between mb-4">
					<motion.button
						onClick={() => router.back()}
						className="px-4 py-2 border-2 border-[#00FFFF] rounded font-mono text-sm uppercase"
						style={{ color: "#00FFFF" }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						← BACK
					</motion.button>
					
					<h1 className="text-2xl md:text-3xl font-bold text-center" style={{
						fontFamily: "'Orbitron', sans-serif",
						color: "#00FFFF",
						textShadow: "0 0 20px rgba(0, 255, 255, 0.5)",
					}}>
						WORKOUT DASHBOARD
					</h1>

					{isTestMode && (
						<motion.button
							onClick={clearHistory}
							className="px-4 py-2 border-2 border-red-500 rounded font-mono text-sm uppercase text-red-500"
							whileHover={{ scale: 1.05, backgroundColor: "rgba(255,0,0,0.1)" }}
							whileTap={{ scale: 0.95 }}
						>
							CLEAR
						</motion.button>
					)}
				</div>

				{/* Test Mode Banner */}
				{isTestMode && (
					<div className="text-center py-2 px-4 bg-purple-500/20 border border-purple-500 rounded-lg mb-4">
						<span className="text-purple-400 font-mono text-sm">
							🧪 TEST MODE: {testModeTier.toUpperCase()} — Data stored in localStorage
						</span>
					</div>
				)}
			</div>

			{/* Main Content - Side by Side */}
			<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
				
				{/* LEFT: Saved Workouts Collection */}
				<div ref={statsRef} className="bg-black/50 border-2 border-[#00FFFF] rounded-xl p-4 md:p-6" style={{
					boxShadow: "0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(0, 255, 255, 0.05)",
				}}>
					<div className="flex items-center gap-3 mb-4">
						<span className="text-2xl">📁</span>
						<h2 className="text-xl font-bold" style={{
							fontFamily: "'Orbitron', sans-serif",
							color: "#00FFFF",
						}}>
							SAVED COLLECTION
						</h2>
						<span className="ml-auto px-3 py-1 bg-[#00FFFF]/20 rounded-full text-sm font-mono text-[#00FFFF]">
							{savedWorkouts.length}
						</span>
					</div>

					{/* Random Workout Button */}
					<motion.button
						onClick={pickRandomWorkout}
						disabled={savedWorkouts.length === 0}
						className="w-full py-3 mb-4 bg-gradient-to-r from-[#00FFFF] to-[#00BFFF] rounded-lg font-bold text-black uppercase disabled:opacity-40 disabled:cursor-not-allowed"
						style={{ fontFamily: "'Orbitron', sans-serif" }}
						whileHover={{ scale: savedWorkouts.length > 0 ? 1.02 : 1 }}
						whileTap={{ scale: savedWorkouts.length > 0 ? 0.98 : 1 }}
					>
						🎲 GIVE ME A RANDOM WORKOUT
					</motion.button>

					{/* Random Workout Display */}
					<AnimatePresence mode="wait">
						{randomWorkout && (
							<motion.div
								key={randomWorkout.id}
								initial={{ opacity: 0, scale: 0.8, y: -10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.8, y: 10 }}
								className="mb-4 p-4 bg-gradient-to-br from-[#00FFFF]/20 to-[#00BFFF]/10 border-2 border-[#00FFFF] rounded-lg"
								style={{
									boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
								}}
							>
								<div className="text-xs text-[#00FFFF] font-mono mb-1">🎯 YOUR RANDOM WORKOUT:</div>
								<div className="text-xl font-bold text-white mb-2">{randomWorkout.workout}</div>
								<div className="flex gap-4 text-sm">
									<div className="bg-black/30 px-3 py-2 rounded">
										<span className="text-gray-400">Sets:</span>
										<span className="text-white font-bold ml-2">{randomWorkout.sets}</span>
									</div>
									<div className="bg-black/30 px-3 py-2 rounded">
										<span className="text-gray-400">Reps:</span>
										<span className="text-white font-bold ml-2">{randomWorkout.amount}</span>
									</div>
									<div className="bg-black/30 px-3 py-2 rounded">
										<span className="text-gray-400">Time:</span>
										<span className="text-white font-bold ml-2">{randomWorkout.repsTime}</span>
									</div>
								</div>
								{randomWorkout.type && (
									<div className="mt-2">
										<span className="text-xs px-2 py-1 rounded font-bold" style={{
											backgroundColor: `${getTypeColor(randomWorkout.type)}20`,
											color: getTypeColor(randomWorkout.type),
										}}>
											{randomWorkout.type.toUpperCase()}
										</span>
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>

					<div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
						{savedWorkouts.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								<div className="text-4xl mb-2">📭</div>
								<p className="font-mono text-sm">No saved workouts yet</p>
								<p className="text-xs mt-1">Click "Save" on workouts to add them here</p>
							</div>
						) : (
							savedWorkouts.map((workout, index) => {
								const { date, time } = formatDate(workout.createdAt);
								const typeColor = getTypeColor(workout.type);
								return (
									<motion.div
										key={workout.id || index}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
										className="bg-black/70 border border-[#00FFFF]/30 rounded-lg p-3"
									>
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<div className="font-bold text-white">{workout.workout}</div>
												<div className="text-xs text-gray-400 font-mono mt-1">
													{workout.sets} sets × {workout.amount} {workout.repsTime}
												</div>
											</div>
											<div className="text-right">
												<div className="text-xs px-2 py-1 rounded font-bold" style={{
													backgroundColor: `${typeColor}20`,
													color: typeColor,
												}}>
													{workout.type?.toUpperCase()}
												</div>
												<div className="text-xs text-gray-500 mt-1">{date}</div>
											</div>
										</div>
									</motion.div>
								);
							})
						)}
					</div>
				</div>

				{/* RIGHT: Completed Workouts (Gamified) */}
				<div ref={completedRef} className="bg-black/50 border-2 border-[#FFD700] rounded-xl p-4 md:p-6" style={{
					boxShadow: "0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 20px rgba(255, 215, 0, 0.05)",
				}}>
					<div className="flex items-center gap-3 mb-4">
						<span className="text-2xl">🏆</span>
						<h2 className="text-xl font-bold" style={{
							fontFamily: "'Orbitron', sans-serif",
							color: "#FFD700",
						}}>
							COMPLETED
						</h2>
						<span className="ml-auto px-3 py-1 bg-[#FFD700]/20 rounded-full text-sm font-mono text-[#FFD700]">
							{completedWorkouts.length}
						</span>
					</div>

					{/* Gamified Stats Section */}
					<div className="mb-4 p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF4500]/10 border border-[#FFD700]/30 rounded-lg">
						<div className="grid grid-cols-3 gap-4 text-center">
							<div className="stat-item">
								<div className="text-2xl font-bold text-[#FFD700]">
									{completedWorkouts.reduce((sum, w) => sum + w.sets, 0)}
								</div>
								<div className="text-xs text-gray-400 font-mono">TOTAL SETS</div>
							</div>
							<div className="stat-item">
								<div className="text-2xl font-bold text-[#00FF00]">
									{completedWorkouts.reduce((sum, w) => sum + (Number(w.amount) || 0), 0)}
								</div>
								<div className="text-xs text-gray-400 font-mono">TOTAL REPS</div>
							</div>
							<div className="stat-item">
								<div className="text-2xl font-bold text-[#FF00FF]">
									{getWorkoutsThisWeek()}
								</div>
								<div className="text-xs text-gray-400 font-mono">THIS WEEK</div>
							</div>
						</div>
					</div>

					{/* Achievements */}
					<div className="mb-4">
						<div className="text-sm font-mono text-gray-400 mb-2">ACHIEVEMENTS</div>
						<div className="flex flex-wrap gap-2">
							{ACHIEVEMENTS.map((achievement) => {
								const earned = earnedAchievements.includes(achievement);
								return (
									<motion.div
										key={achievement.id}
										className={`px-3 py-2 rounded-lg border text-center ${
											earned
												? "bg-[#FFD700]/20 border-[#FFD700]"
												: "bg-gray-900/50 border-gray-700 opacity-40"
										}`}
										whileHover={{ scale: 1.05 }}
										title={`${achievement.name}: ${achievement.desc}`}
									>
										<div className="text-xl">{achievement.icon}</div>
										<div className="text-xs font-mono mt-1" style={{
											color: earned ? "#FFD700" : "#666",
										}}>
											{achievement.requirement}
										</div>
									</motion.div>
								);
							})}
						</div>
					</div>

					{/* Completed Workouts List */}
					<div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
						{completedWorkouts.length === 0 ? (
							<div className="text-center py-6 text-gray-500">
								<div className="text-4xl mb-2">🎯</div>
								<p className="font-mono text-sm">No completed workouts yet</p>
								<p className="text-xs mt-1">Click "Mark Done" to log completions</p>
							</div>
						) : (
							completedWorkouts.slice(0, 10).map((workout, index) => {
								const { date, time } = formatDate(workout.completedAt || workout.createdAt);
								return (
									<motion.div
										key={workout.id || index}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.03 }}
										className="flex items-center gap-3 bg-black/50 border border-[#FFD700]/20 rounded-lg p-2"
									>
										<div className="text-green-500">✅</div>
										<div className="flex-1 min-w-0">
											<div className="font-bold text-white text-sm truncate">{workout.workout}</div>
											<div className="text-xs text-gray-500">{workout.sets}×{workout.amount}</div>
										</div>
										<div className="text-xs text-gray-500 text-right">
											<div>{time}</div>
											<div>{date}</div>
										</div>
									</motion.div>
								);
							})
						)}
						{completedWorkouts.length > 10 && (
							<div className="text-center text-gray-500 text-sm py-2">
								+{completedWorkouts.length - 10} more
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="max-w-7xl mx-auto mt-6 text-center">
				<p className="text-gray-600 font-mono text-xs">
					ARMCHAIR WORKOUTS // DASHBOARD v2.0
				</p>
			</div>

			{/* Custom Scrollbar Styles */}
			<style jsx global>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: rgba(0, 0, 0, 0.3);
					border-radius: 3px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(0, 255, 255, 0.3);
					border-radius: 3px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(0, 255, 255, 0.5);
				}
			`}</style>
		</div>
	);
}
