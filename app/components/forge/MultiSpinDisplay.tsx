"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ForgeReel from "./ForgeReel";
import type { WorkoutResult } from "@/app/lib/workoutRandomizer";

interface MultiSpinDisplayProps {
	results: WorkoutResult[];
	isSpinning: boolean;
	spinCount: number;
	onSaveWorkout?: (workout: WorkoutResult, index: number) => Promise<void>;
	onCompleteWorkout?: (index: number, event: React.MouseEvent) => void;
	savedWorkouts?: Set<number>;
	completedWorkouts?: Set<number>;
}

export default function MultiSpinDisplay({
	results,
	isSpinning,
	spinCount,
	onSaveWorkout,
	onCompleteWorkout,
	savedWorkouts = new Set(),
	completedWorkouts = new Set(),
}: MultiSpinDisplayProps) {
	const displayResults = Array.from({ length: spinCount }, (_, i) => results[i] || null);
	const [savingIndex, setSavingIndex] = useState<number | null>(null);

	const handleSave = async (workout: WorkoutResult, index: number) => {
		if (!onSaveWorkout || !workout) return;
		setSavingIndex(index);
		try {
			await onSaveWorkout(workout, index);
		} finally {
			setSavingIndex(null);
		}
	};

	return (
		<div className="space-y-4">
			{displayResults.map((result, index) => (
				<motion.div
					key={index}
					className="rounded-lg p-4 relative"
					style={{
						background: completedWorkouts.has(index) 
							? "rgba(0, 255, 0, 0.05)" 
							: "#000000",
						border: completedWorkouts.has(index)
							? "2px solid #00FF00"
							: "2px solid #00FFFF",
						boxShadow: completedWorkouts.has(index)
							? "inset 0 0 20px rgba(0, 255, 0, 0.15), 0 0 15px rgba(0, 255, 0, 0.4)"
							: "inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 10px rgba(0, 255, 255, 0.3)",
					}}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					{/* Completed Badge */}
					{completedWorkouts.has(index) && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10"
							style={{
								boxShadow: "0 0 15px rgba(0, 255, 0, 0.6)",
							}}
						>
							✅ DONE
						</motion.div>
					)}

					{/* Exercise Number */}
					<div className="text-xs uppercase tracking-wider mb-2 text-center" style={{
						fontFamily: "'Courier New', monospace",
						color: completedWorkouts.has(index) ? "#00FF00" : "#00FFFF",
						textShadow: `0 0 5px ${completedWorkouts.has(index) ? "rgba(0, 255, 0, 0.5)" : "rgba(0, 255, 255, 0.5)"}`,
					}}>
						EXERCISE {index + 1}
					</div>

					{/* Reels Grid - Compact */}
					<div className="flex flex-wrap justify-center gap-2">
						<ForgeReel
							type="sets"
							value={result?.sets ?? null}
							isSpinning={isSpinning}
							delay={index * 0.1}
						/>
						<ForgeReel
							type="workout"
							value={result?.workout ?? null}
							isSpinning={isSpinning}
							delay={index * 0.1 + 0.1}
							description={result?.description}
						/>
						<ForgeReel
							type="amount"
							value={result?.amount ?? null}
							isSpinning={isSpinning}
							delay={index * 0.1 + 0.2}
						/>
						<ForgeReel
							type="repsTime"
							value={result?.repsTime ?? null}
							isSpinning={isSpinning}
							delay={index * 0.1 + 0.3}
						/>
					</div>

					{/* Action Buttons */}
					{result && !isSpinning && (
						<div className="mt-3 flex justify-center gap-2">
							{/* Complete Button */}
							<motion.button
								onClick={(e) => onCompleteWorkout?.(index, e)}
								className="px-3 py-1.5 border-2 rounded font-mono text-xs font-bold uppercase transition-all"
								style={
									completedWorkouts.has(index)
										? {
												borderColor: "#00FF00",
												background: "rgba(0, 255, 0, 0.2)",
												color: "#00FF00",
												boxShadow: "0 0 15px rgba(0, 255, 0, 0.5)",
											}
										: {
												borderColor: "#FFD700",
												background: "rgba(255, 215, 0, 0.05)",
												color: "#FFD700",
												boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
											}
								}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								{completedWorkouts.has(index) ? "✅ DONE" : "💪 DONE"}
							</motion.button>

							{/* Save Button */}
							<motion.button
								onClick={() => handleSave(result, index)}
								disabled={savingIndex === index || savedWorkouts.has(index)}
								className="px-3 py-1.5 border-2 rounded font-mono text-xs font-bold uppercase transition-all"
								style={
									savedWorkouts.has(index)
										? {
												borderColor: "#00FF00",
												background: "rgba(0, 255, 0, 0.1)",
												color: "#00FF00",
												boxShadow: "0 0 10px rgba(0, 255, 0, 0.5)",
												cursor: "default",
											}
										: {
												borderColor: "#00FFFF",
												background: "rgba(0, 255, 255, 0.05)",
												color: "#00FFFF",
												boxShadow: "0 0 10px rgba(0, 255, 255, 0.3)",
											}
								}
								whileHover={!savedWorkouts.has(index) ? { scale: 1.05 } : {}}
								whileTap={!savedWorkouts.has(index) ? { scale: 0.95 } : {}}
							>
								{savingIndex === index 
									? "..." 
									: savedWorkouts.has(index) 
										? "📁 SAVED" 
										: "💾 SAVE"}
							</motion.button>
						</div>
					)}
				</motion.div>
			))}
		</div>
	);
}
