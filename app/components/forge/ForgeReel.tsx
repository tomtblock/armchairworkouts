"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ExerciseModal from "./ExerciseModal";

interface ForgeReelProps {
	type: "sets" | "workout" | "amount" | "repsTime" | "type";
	value: string | number | null;
	isSpinning: boolean;
	delay?: number;
	description?: string;
}

const reelLabels = {
	sets: "SETS",
	workout: "WORKOUT",
	amount: "VOLUME",
	repsTime: "REPS/TIME",
	type: "TYPE",
};

export default function ForgeReel({
	type,
	value,
	isSpinning,
	delay = 0,
	description,
}: ForgeReelProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const showInfoButton = type === "workout" && value !== null && description;

	return (
		<div className="flex flex-col items-center gap-2">
			{/* Label with Info Button */}
			<div className="flex items-center gap-2 mb-1">
				<div className="text-1 uppercase tracking-wider" style={{
					fontFamily: "'Orbitron', sans-serif",
					color: "#00FFFF",
					textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
				}}>
					{reelLabels[type]}
				</div>
				{showInfoButton && (
					<button
						onClick={() => setIsModalOpen(true)}
						className="transition-colors"
						style={{
							color: "#00FFFF",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.textShadow = "0 0 10px rgba(0, 255, 255, 0.8)";
							e.currentTarget.style.transform = "scale(1.2)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.textShadow = "none";
							e.currentTarget.style.transform = "scale(1)";
						}}
						aria-label="Show exercise description"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="16" x2="12" y2="12" />
							<line x1="12" y1="8" x2="12.01" y2="8" />
						</svg>
					</button>
				)}
			</div>

			{/* Reel Panel - Terminal Window Style */}
			<motion.div
				key={`reel-${type}-${isSpinning}`}
				className={`relative w-28 h-36 rounded overflow-hidden ${isSpinning ? "glitch" : ""}`}
				style={{
					background: "#000000",
					border: "2px solid #00FFFF",
					boxShadow: isSpinning
						? "inset 0 0 20px rgba(0, 255, 255, 0.2), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3)"
						: "inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 10px rgba(0, 255, 255, 0.3), 0 0 20px rgba(0, 255, 255, 0.2)",
				}}
				animate={
					isSpinning
						? {
								rotateY: [0, 180, 360, 540, 720],
								scale: [1, 1.05, 1],
							}
						: {
								rotateY: 0,
								scale: 1,
							}
				}
				transition={
					isSpinning
						? {
								duration: 0.5,
								delay: delay,
								ease: "linear",
								repeat: Infinity,
								repeatType: "loop" as const,
							}
						: {
								duration: 0.3,
								ease: "easeOut",
							}
				}
			>
				{/* Terminal Corner Brackets */}
				<div className="absolute top-1 left-1 w-3 h-3 border-l border-t border-[#00FFFF]" style={{
					boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
				}} />
				<div className="absolute top-1 right-1 w-3 h-3 border-r border-t border-[#00FFFF]" style={{
					boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
				}} />
				<div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b border-[#00FFFF]" style={{
					boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
				}} />
				<div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-[#00FFFF]" style={{
					boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
				}} />

				{/* Content */}
				<div className="absolute inset-0 flex items-center justify-center">
					<AnimatePresence mode="wait">
						{isSpinning ? (
							<motion.div
								key="spinning"
								initial={{ opacity: 0, rotate: -180 }}
								animate={{
									opacity: [0.4, 1, 0.4],
									rotate: 360,
								}}
								exit={{ opacity: 0 }}
								transition={{
									duration: 0.3,
									repeat: Infinity,
									ease: "linear",
								}}
								className="text-9 font-bold"
								style={{
									fontFamily: "'Courier New', monospace",
									color: "#00FFFF",
									textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
								}}
							>
								?
							</motion.div>
						) : value !== null ? (
							<motion.div
								key="result"
								initial={{ opacity: 0, rotateY: -90 }}
								animate={{
									opacity: 1,
									rotateY: 0,
								}}
								exit={{ opacity: 0, rotateY: 90 }}
								transition={{
									duration: 0.5,
									ease: [0.34, 1.56, 0.64, 1], // easeOutBack
								}}
								className="text-center px-1 w-full"
							>
								{type === "workout" ? (
									// Workout names - terminal green text
									<div className="text-3 font-bold leading-tight" style={{
										fontFamily: "'Courier New', monospace",
										color: "#00FF00",
										textShadow: "0 0 10px rgba(0, 255, 0, 0.8)",
										wordBreak: "break-word",
										overflowWrap: "break-word",
										lineHeight: "1.2",
									}}>
										{value}
									</div>
								) : type === "type" ? (
									// Category/Type - cyan text
									<div className="text-2 font-bold leading-tight" style={{
										fontFamily: "'Courier New', monospace",
										color: "#00FFFF",
										textShadow: "0 0 8px rgba(0, 255, 255, 0.8)",
										wordBreak: "break-word",
										overflowWrap: "break-word",
										lineHeight: "1.2",
									}}>
										{value}
									</div>
								) : (
									// Numbers and short text - cyan text, larger font
									<div className="text-5 font-bold leading-none" style={{
										fontFamily: "'Courier New', monospace",
										color: "#00FFFF",
										textShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 25px rgba(0, 255, 255, 0.5)",
									}}>
										{value}
									</div>
								)}
							</motion.div>
						) : (
							<div className="text-9 font-bold" style={{
								fontFamily: "'Courier New', monospace",
								color: "#00FFFF",
								textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
							}}>?</div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>

			{/* Exercise Description Modal */}
			{showInfoButton && (
				<ExerciseModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					exercise={value as string}
					description={description || ""}
				/>
			)}
		</div>
	);
}

