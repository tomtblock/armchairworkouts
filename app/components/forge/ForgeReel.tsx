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
	const isWorkoutReel = type === "workout";

	return (
		<div className="flex flex-col items-center gap-2 relative">
			{/* Label with Animated Info Button */}
			<div className="flex items-center gap-2 mb-1 relative">
				<div className="text-1 uppercase tracking-wider" style={{
					fontFamily: "'Orbitron', sans-serif",
					color: "#00FFFF",
					textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
				}}>
					{reelLabels[type]}
				</div>
				{showInfoButton && (
					<div className="relative">
						{/* Neon pulse rings */}
						<motion.div
							className="absolute inset-0 rounded-full"
							style={{
								background: "radial-gradient(circle, rgba(0,255,255,0.5) 0%, transparent 70%)",
							}}
							animate={{
								scale: [1, 2.5, 1],
								opacity: [0.8, 0, 0.8],
							}}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								ease: "easeOut",
							}}
						/>
						<motion.div
							className="absolute inset-0 rounded-full"
							style={{
								background: "radial-gradient(circle, rgba(255,0,255,0.4) 0%, transparent 70%)",
							}}
							animate={{
								scale: [1, 2, 1],
								opacity: [0.6, 0, 0.6],
							}}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								ease: "easeOut",
								delay: 0.4,
							}}
						/>
						{/* Main button - Neon cyan/magenta */}
						<motion.button
							onClick={() => setIsModalOpen(true)}
							className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center"
							style={{
								background: "linear-gradient(135deg, #00FFFF 0%, #FF00FF 100%)",
								boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(255, 0, 255, 0.4)",
							}}
							animate={{
								boxShadow: [
									"0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(255, 0, 255, 0.4)",
									"0 0 25px rgba(255, 0, 255, 0.9), 0 0 40px rgba(0, 255, 255, 0.6)",
									"0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(255, 0, 255, 0.4)",
								],
							}}
							transition={{
								duration: 1,
								repeat: Infinity,
								ease: "easeInOut",
							}}
							whileHover={{
								scale: 1.3,
								boxShadow: "0 0 30px rgba(0, 255, 255, 1), 0 0 50px rgba(255, 0, 255, 0.8)",
							}}
							whileTap={{ scale: 0.9 }}
							aria-label="Show exercise description"
						>
							<span className="text-black font-bold text-sm">?</span>
						</motion.button>
					</div>
				)}
			</div>

			{/* Reel Panel */}
			<motion.div
				key={`reel-${type}-${isSpinning}`}
				className={`relative ${type === "workout" ? "w-56" : "w-28"} h-36 rounded overflow-hidden ${isSpinning ? "glitch" : ""}`}
				style={{
					background: "#000000",
					border: isWorkoutReel && value && !isSpinning 
						? "2px solid #FF00FF" 
						: "2px solid #00FFFF",
					boxShadow: isSpinning
						? "inset 0 0 20px rgba(0, 255, 255, 0.2), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3)"
						: isWorkoutReel && value && !isSpinning
							? "inset 0 0 25px rgba(255, 0, 255, 0.2), 0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)"
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
				{/* Cyberpunk Neon Edge Lights for Workout Reel */}
				{isWorkoutReel && value && !isSpinning && (
					<>
						{/* Scanning line effect */}
						<motion.div
							className="absolute left-0 right-0 h-0.5"
							style={{
								background: "linear-gradient(90deg, transparent, #00FFFF, #FF00FF, #00FFFF, transparent)",
								boxShadow: "0 0 10px #00FFFF, 0 0 20px #FF00FF",
							}}
							animate={{
								top: ["0%", "100%", "0%"],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "linear",
							}}
						/>
						{/* Corner glow pulses */}
						{[
							{ top: 0, left: 0 },
							{ top: 0, right: 0 },
							{ bottom: 0, left: 0 },
							{ bottom: 0, right: 0 },
						].map((pos, i) => (
							<motion.div
								key={`corner-${i}`}
								className="absolute w-4 h-4"
								style={{
									...pos,
									background: `radial-gradient(circle, ${i % 2 === 0 ? "#00FFFF" : "#FF00FF"} 0%, transparent 70%)`,
								}}
								animate={{
									opacity: [0.3, 1, 0.3],
									scale: [1, 1.5, 1],
								}}
								transition={{
									duration: 1,
									repeat: Infinity,
									delay: i * 0.2,
								}}
							/>
						))}
					</>
				)}

				{/* Terminal Corner Brackets */}
				<div className="absolute top-1 left-1 w-3 h-3 border-l border-t" style={{
					borderColor: isWorkoutReel && value && !isSpinning ? "#FF00FF" : "#00FFFF",
					boxShadow: `0 0 5px ${isWorkoutReel && value && !isSpinning ? "rgba(255, 0, 255, 0.5)" : "rgba(0, 255, 255, 0.5)"}`,
				}} />
				<div className="absolute top-1 right-1 w-3 h-3 border-r border-t" style={{
					borderColor: isWorkoutReel && value && !isSpinning ? "#FF00FF" : "#00FFFF",
					boxShadow: `0 0 5px ${isWorkoutReel && value && !isSpinning ? "rgba(255, 0, 255, 0.5)" : "rgba(0, 255, 255, 0.5)"}`,
				}} />
				<div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b" style={{
					borderColor: isWorkoutReel && value && !isSpinning ? "#FF00FF" : "#00FFFF",
					boxShadow: `0 0 5px ${isWorkoutReel && value && !isSpinning ? "rgba(255, 0, 255, 0.5)" : "rgba(0, 255, 255, 0.5)"}`,
				}} />
				<div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b" style={{
					borderColor: isWorkoutReel && value && !isSpinning ? "#FF00FF" : "#00FFFF",
					boxShadow: `0 0 5px ${isWorkoutReel && value && !isSpinning ? "rgba(255, 0, 255, 0.5)" : "rgba(0, 255, 255, 0.5)"}`,
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
									ease: [0.34, 1.56, 0.64, 1],
								}}
								className="text-center px-1 w-full"
							>
								{type === "workout" ? (
									<motion.div 
										className="text-3 font-bold leading-tight" 
										style={{
											fontFamily: "'Courier New', monospace",
											color: "#00FF00",
											textShadow: "0 0 10px rgba(0, 255, 0, 0.8)",
											wordBreak: "break-word",
											overflowWrap: "break-word",
											lineHeight: "1.2",
										}}
										animate={{
											textShadow: [
												"0 0 10px rgba(0, 255, 0, 0.8)",
												"0 0 20px rgba(0, 255, 0, 1), 0 0 30px rgba(0, 255, 255, 0.5)",
												"0 0 10px rgba(0, 255, 0, 0.8)",
											],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									>
										{value}
									</motion.div>
								) : type === "type" ? (
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
