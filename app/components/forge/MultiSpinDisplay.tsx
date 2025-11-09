"use client";

import { motion } from "framer-motion";
import ForgeReel from "./ForgeReel";
import type { WorkoutResult } from "@/app/lib/workoutRandomizer";

interface MultiSpinDisplayProps {
	results: WorkoutResult[];
	isSpinning: boolean;
	spinCount: number;
}

export default function MultiSpinDisplay({
	results,
	isSpinning,
	spinCount,
}: MultiSpinDisplayProps) {
	// Create array of results, padding with nulls if needed
	const displayResults = Array.from({ length: spinCount }, (_, i) => results[i] || null);

	return (
		<div className="space-y-6">
			{displayResults.map((result, index) => (
				<motion.div
					key={index}
					className="rounded-lg p-4 relative"
					style={{
						background: "#000000",
						border: "2px solid #00FFFF",
						boxShadow: "inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 10px rgba(0, 255, 255, 0.3), 0 0 20px rgba(0, 255, 255, 0.2)",
					}}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					{/* Terminal Corner Brackets */}
					<div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-[#00FFFF]" style={{
						boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-[#00FFFF]" style={{
						boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-[#00FFFF]" style={{
						boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-[#00FFFF]" style={{
						boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
					}} />

					{/* Spin Label */}
					<div className="text-1 uppercase tracking-wider mb-3 text-center" style={{
						fontFamily: "'Courier New', monospace",
						color: "#00FFFF",
						textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
					}}>
						COMBINATION {index + 1}
					</div>

					{/* Reels Grid */}
					<div className="flex flex-wrap justify-center gap-3 md:gap-4">
						<ForgeReel
							type="sets"
							value={result?.sets ?? null}
							isSpinning={isSpinning}
							delay={index * 0.1 + 0}
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
						<ForgeReel
							type="type"
							value={result?.type ?? null}
							isSpinning={isSpinning}
							delay={index * 0.1 + 0.4}
						/>
					</div>
				</motion.div>
			))}
		</div>
	);
}

