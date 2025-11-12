"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeaderStatusBar from "./HeaderStatusBar";
import type { SubscriptionStatus } from "@/app/api/subscription/route";

interface WorkoutHistoryItem {
	sets: number;
	workout: string;
	amount: number | string;
	repsTime: string;
	type: string;
	description?: string;
	userComment?: string;
	createdAt: string;
	id: string;
}

interface ExerciseStats {
	exercise: string;
	totalCompleted: number;
	totalSets: number;
	totalReps: number;
	lastCompleted: string;
}

export default function WorkoutHistoryDashboard() {
	const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
	const [selectedView, setSelectedView] = useState<"timeline" | "exercises">("timeline");
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [commentText, setCommentText] = useState<string>("");

	useEffect(() => {
		loadHistory();
		loadSubscription();
	}, []);

	const loadHistory = async () => {
		try {
			const response = await fetch("/api/workout-history");
			if (response.ok) {
				const data = await response.json();
				setHistory(data.history || []);
			} else if (response.status === 403) {
				// User doesn't have Premium - this shouldn't happen as the page checks, but handle gracefully
				console.error("Access denied - Premium subscription required");
			}
		} catch (error) {
			console.error("Failed to load history:", error);
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

	const handleEditComment = (workout: WorkoutHistoryItem) => {
		setEditingCommentId(workout.id);
		setCommentText(workout.userComment || "");
	};

	const handleSaveComment = async (workoutId: string) => {
		try {
			const response = await fetch("/api/workout-history/comment", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ workoutId, comment: commentText.trim() || null }),
			});

			if (response.ok) {
				// Update local state
				setHistory((prev) =>
					prev.map((w) =>
						w.id === workoutId ? { ...w, userComment: commentText.trim() || undefined } : w
					)
				);
				setEditingCommentId(null);
				setCommentText("");
			} else {
				console.error("Failed to save comment");
			}
		} catch (error) {
			console.error("Error saving comment:", error);
		}
	};

	const handleCancelComment = () => {
		setEditingCommentId(null);
		setCommentText("");
	};

	// Calculate exercise statistics
	const exerciseStats: ExerciseStats[] = Object.entries(
		history.reduce((acc, workout) => {
			const exercise = workout.workout;
			if (!acc[exercise]) {
				acc[exercise] = {
					exercise,
					totalCompleted: 0,
					totalSets: 0,
					totalReps: 0,
					lastCompleted: workout.createdAt,
				};
			}
			acc[exercise].totalCompleted++;
			acc[exercise].totalSets += workout.sets;
			acc[exercise].totalReps += typeof workout.amount === "number" ? workout.amount : parseInt(String(workout.amount)) || 0;
			if (new Date(workout.createdAt) > new Date(acc[exercise].lastCompleted)) {
				acc[exercise].lastCompleted = workout.createdAt;
			}
			return acc;
		}, {} as Record<string, ExerciseStats>)
	)
		.map(([_, stats]) => stats)
		.sort((a, b) => b.totalCompleted - a.totalCompleted);

	// Group workouts by date
	const workoutsByDate = history.reduce((acc, workout) => {
		const date = new Date(workout.createdAt).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(workout);
		return acc;
	}, {} as Record<string, WorkoutHistoryItem[]>);

	const sortedDates = Object.keys(workoutsByDate).sort((a, b) => {
		return new Date(b).getTime() - new Date(a).getTime();
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-center">
					<p className="text-[#00FFFF] text-xl" style={{
						fontFamily: "'Courier New', monospace",
						textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
					}}>
						&gt; LOADING WORKOUT HISTORY...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col relative overflow-hidden" style={{
			background: "#000000",
		}}>
			{/* Header Status Bar */}
			<div className="w-full pt-4 z-10 relative">
				<HeaderStatusBar status="online" ready={!loading} />
			</div>

			{/* Subscription Status */}
			{subscription && (
				<div className="px-4 z-10 relative">
					<div className={`px-4 py-2 rounded-lg mb-4 ${
						subscription.tier === "premium" 
							? "bg-gradient-to-r from-purple-600 to-blue-600"
							: subscription.tier === "standard"
							? "bg-gradient-to-r from-green-600 to-emerald-600"
							: "bg-gradient-to-r from-orange-600 to-red-600"
					}`}>
						<div className="flex items-center gap-2">
							<span className="text-white font-semibold">
								{subscription.tier === "premium" && "⭐ Premium"}
								{subscription.tier === "standard" && "✓ Standard"}
								{subscription.tier === "free" && `Free Spins: ${subscription.freeSpinsRemaining} remaining`}
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="flex-1 px-4 pb-4 z-10 relative overflow-y-auto">
				{/* Terminal Window */}
				<div className="terminal-window scanline rounded-lg p-6 md:p-8 min-h-[600px]" style={{
					border: "2px solid #00FFFF",
					boxShadow: "inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 30px rgba(0, 255, 255, 0.3)",
				}}>
					{/* Terminal Corner Brackets */}
					<div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />

					{/* Terminal Header */}
					<div className="mb-6">
						<h1 className="text-4xl font-bold mb-2" style={{
							fontFamily: "'Orbitron', sans-serif",
							color: "#00FFFF",
							textShadow: "0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)",
						}}>
							WORKOUT HISTORY
						</h1>
						<p className="text-2" style={{
							fontFamily: "'Courier New', monospace",
							color: "#00FF00",
							textShadow: "0 0 10px rgba(0, 255, 0, 0.8)",
						}}>
							&gt; TOTAL WORKOUTS: {history.length}
						</p>
					</div>

					{/* View Toggle */}
					<div className="flex gap-2 mb-6">
						<button
							onClick={() => setSelectedView("timeline")}
							className={`px-4 py-2 border-2 rounded font-mono text-sm font-bold uppercase transition-all ${
								selectedView === "timeline"
									? "border-[#00FFFF] bg-[#00FFFF]/10 text-[#00FFFF]"
									: "border-[#333] text-gray-500 hover:border-[#00FFFF]"
							}`}
							style={selectedView === "timeline" ? {
								boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
								textShadow: "0 0 5px rgba(0, 255, 255, 0.8)",
							} : {}}
						>
							TIMELINE
						</button>
						<button
							onClick={() => setSelectedView("exercises")}
							className={`px-4 py-2 border-2 rounded font-mono text-sm font-bold uppercase transition-all ${
								selectedView === "exercises"
									? "border-[#00FFFF] bg-[#00FFFF]/10 text-[#00FFFF]"
									: "border-[#333] text-gray-500 hover:border-[#00FFFF]"
							}`}
							style={selectedView === "exercises" ? {
								boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
								textShadow: "0 0 5px rgba(0, 255, 255, 0.8)",
							} : {}}
						>
							EXERCISES
						</button>
					</div>

					{/* Content Area */}
					<div className="space-y-6">
						{selectedView === "timeline" ? (
							/* Timeline View */
							<div className="space-y-6">
								{history.length === 0 ? (
									<div className="text-center py-12">
										<p className="text-[#00FFFF] text-lg" style={{
											fontFamily: "'Courier New', monospace",
											textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
										}}>
											&gt; NO WORKOUT HISTORY FOUND
										</p>
										<p className="text-gray-400 text-sm mt-2">
											Complete workouts to see them here
										</p>
									</div>
								) : (
									sortedDates.map((date) => (
										<div key={date} className="border border-[#00FFFF] rounded-lg p-4 bg-black/30" style={{
											boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)",
										}}>
											<h3 className="text-xl font-bold mb-4" style={{
												fontFamily: "'Orbitron', sans-serif",
												color: "#00FFFF",
												textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
											}}>
												{date}
											</h3>
											<div className="space-y-3">
												{workoutsByDate[date].map((workout) => (
													<div
														key={workout.id}
														className="p-3 bg-black/50 rounded border border-[#00FFFF]/30"
													>
														<div className="flex flex-wrap items-center gap-4">
															<div className="flex-1 min-w-[200px]">
																<div className="text-white font-semibold text-lg mb-1">
																	{workout.workout}
																</div>
																<div className="text-gray-400 text-sm">
																	{workout.type}
																</div>
															</div>
															<div className="flex gap-4 text-sm">
																<div>
																	<div className="text-[#00FFFF] font-mono">SETS</div>
																	<div className="text-white font-bold">{workout.sets}</div>
																</div>
																<div>
																	<div className="text-[#00FFFF] font-mono">{workout.repsTime.toUpperCase()}</div>
																	<div className="text-white font-bold">{workout.amount}</div>
																</div>
															</div>
															<div className="text-xs text-gray-500 font-mono">
																{new Date(workout.createdAt).toLocaleTimeString("en-GB", {
																	hour: "2-digit",
																	minute: "2-digit",
																})}
															</div>
														</div>
														{workout.description && (
															<div className="mt-2 text-gray-400 text-xs italic">
																{workout.description}
															</div>
														)}
														
														{/* Comment Section */}
														<div className="mt-3 pt-3 border-t border-[#00FFFF]/20">
															{editingCommentId === workout.id ? (
																<div className="space-y-2">
																	<textarea
																		value={commentText}
																		onChange={(e) => setCommentText(e.target.value)}
																		placeholder="Add a comment about this workout..."
																		className="w-full p-2 bg-black/50 border border-[#00FFFF] rounded text-white text-sm font-mono resize-none"
																		style={{
																			color: "#FFFFFF",
																			boxShadow: "0 0 5px rgba(0, 255, 255, 0.3)",
																		}}
																		rows={2}
																	/>
																	<div className="flex gap-2">
																		<button
																			onClick={() => handleSaveComment(workout.id)}
																			className="px-3 py-1 border border-[#00FF00] rounded text-xs font-mono font-bold uppercase transition-all hover:bg-[#00FF00]/10"
																			style={{
																				color: "#00FF00",
																				boxShadow: "0 0 5px rgba(0, 255, 0, 0.3)",
																			}}
																		>
																			SAVE
																		</button>
																		<button
																			onClick={handleCancelComment}
																			className="px-3 py-1 border border-[#666] rounded text-xs font-mono font-bold uppercase transition-all hover:bg-[#666]/10 text-gray-400"
																		>
																			CANCEL
																		</button>
																	</div>
																</div>
															) : (
																<div className="flex items-start justify-between gap-2">
																	{workout.userComment ? (
																		<div className="flex-1">
																			<div className="text-[#00FFFF] text-xs font-mono mb-1">COMMENT:</div>
																			<div className="text-gray-300 text-sm">{workout.userComment}</div>
																		</div>
																	) : (
																		<div className="text-gray-500 text-xs font-mono italic">
																			No comment
																		</div>
																	)}
																	<button
																		onClick={() => handleEditComment(workout)}
																		className="px-2 py-1 border border-[#00FFFF] rounded text-xs font-mono font-bold uppercase transition-all hover:bg-[#00FFFF]/10 flex-shrink-0"
																		style={{
																			color: "#00FFFF",
																			boxShadow: "0 0 5px rgba(0, 255, 255, 0.3)",
																		}}
																	>
																		{workout.userComment ? "EDIT" : "ADD"}
																	</button>
																</div>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									))
								)}
							</div>
						) : (
							/* Exercises View */
							<div className="space-y-4">
								{exerciseStats.length === 0 ? (
									<div className="text-center py-12">
										<p className="text-[#00FFFF] text-lg" style={{
											fontFamily: "'Courier New', monospace",
											textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
										}}>
											&gt; NO EXERCISE DATA FOUND
										</p>
									</div>
								) : (
									exerciseStats.map((stat, index) => (
										<motion.div
											key={stat.exercise}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											className="border border-[#00FFFF] rounded-lg p-4 bg-black/30" style={{
												boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)",
											}}
										>
											<div className="flex justify-between items-start mb-3">
												<div className="flex-1">
													<h4 className="text-xl font-bold text-white mb-2" style={{
														fontFamily: "'Orbitron', sans-serif",
													}}>
														{stat.exercise}
													</h4>
													<div className="grid grid-cols-3 gap-4 text-sm">
														<div>
															<div className="text-[#00FFFF] font-mono text-xs mb-1">COMPLETED</div>
															<div className="text-white font-bold text-lg">{stat.totalCompleted}</div>
														</div>
														<div>
															<div className="text-[#00FFFF] font-mono text-xs mb-1">TOTAL SETS</div>
															<div className="text-white font-bold text-lg">{stat.totalSets}</div>
														</div>
														<div>
															<div className="text-[#00FFFF] font-mono text-xs mb-1">TOTAL REPS</div>
															<div className="text-white font-bold text-lg">{stat.totalReps}</div>
														</div>
													</div>
												</div>
												<div className="text-right">
													<div className="text-[#00FFFF] font-mono text-xs mb-1">LAST COMPLETED</div>
													<div className="text-gray-400 text-xs">
														{new Date(stat.lastCompleted).toLocaleDateString("en-GB", {
															day: "numeric",
															month: "short",
															year: "numeric",
														})}
													</div>
												</div>
											</div>
										</motion.div>
									))
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full py-4 px-4 border-t" style={{
				borderColor: "#00FFFF",
				boxShadow: "0 -2px 10px rgba(0, 255, 255, 0.3)",
			}}>
				<div className="max-w-4xl mx-auto text-center">
					<p className="text-1 uppercase tracking-wider" style={{
						fontFamily: "'Courier New', monospace",
						color: "#00FFFF",
						textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
					}}>
						WORKOUT HISTORY // TBLOCK SYSTEM
					</p>
				</div>
			</footer>
		</div>
	);
}

