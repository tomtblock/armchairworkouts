"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@whop/react/components";

interface ExerciseModalProps {
	isOpen: boolean;
	onClose: () => void;
	exercise: string;
	description: string;
}

export default function ExerciseModal({
	isOpen,
	onClose,
	exercise,
	description,
}: ExerciseModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/60 z-50"
						onClick={onClose}
					/>
					{/* Modal */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							className="terminal-window rounded-lg p-6 max-w-md w-full pointer-events-auto relative"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Terminal Corner Brackets */}
							<div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-[#00FFFF]" style={{
								boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
							}} />
							<div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-[#00FFFF]" style={{
								boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
							}} />
							<div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-[#00FFFF]" style={{
								boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
							}} />
							<div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-[#00FFFF]" style={{
								boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
							}} />

							{/* Close Button */}
							<button
								onClick={onClose}
								className="absolute top-4 right-4 transition-colors"
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
								aria-label="Close modal"
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>

							{/* Content */}
							<div className="space-y-4">
								<h3
									className="text-5 font-bold uppercase tracking-wider"
									style={{ 
										fontFamily: "'Orbitron', sans-serif",
										color: "#00FFFF",
										textShadow: "0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)",
									}}
								>
									{exercise}
								</h3>
								<div className="border-t border-[#00FFFF] pt-4" style={{
									boxShadow: "0 1px 5px rgba(0, 255, 255, 0.3)",
								}}>
									<p className="text-3 leading-relaxed" style={{
										fontFamily: "'Courier New', monospace",
										color: "#00FF00",
										textShadow: "0 0 5px rgba(0, 255, 0, 0.5)",
									}}>
										{description || "No description available."}
									</p>
								</div>
								<div className="flex justify-end pt-2">
									<Button
										variant="classic"
										size="3"
										onClick={onClose}
										className="uppercase tracking-wider"
										style={{
											fontFamily: "'Orbitron', sans-serif",
											border: "2px solid #00FFFF",
											boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
										}}
									>
										Close
									</Button>
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}

