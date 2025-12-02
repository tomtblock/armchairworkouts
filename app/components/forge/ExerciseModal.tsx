"use client";

import { motion, AnimatePresence } from "framer-motion";

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
						className="fixed inset-0 bg-black/80 z-50"
						onClick={onClose}
					/>
					{/* Modal - 2x larger */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.5, y: 40 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.5, y: 40 }}
							transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
							className="rounded-2xl p-10 max-w-3xl w-full pointer-events-auto relative"
							style={{
								background: "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(10,10,30,0.95) 100%)",
								border: "3px solid #00FFFF",
								boxShadow: "0 0 60px rgba(0, 255, 255, 0.4), inset 0 0 40px rgba(0, 255, 255, 0.1)",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							{/* Animated corner brackets - larger */}
							<motion.div 
								className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-[#00FFFF]"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 2, repeat: Infinity }}
								style={{ boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
							/>
							<motion.div 
								className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-[#00FFFF]"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
								style={{ boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
							/>
							<motion.div 
								className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-[#00FFFF]"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 2, repeat: Infinity, delay: 1 }}
								style={{ boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
							/>
							<motion.div 
								className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-[#00FFFF]"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
								style={{ boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
							/>

							{/* Close Button - larger */}
							<motion.button
								onClick={onClose}
								className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full"
								style={{
									background: "rgba(255, 0, 0, 0.2)",
									border: "2px solid #FF0000",
									color: "#FF0000",
								}}
								whileHover={{ 
									scale: 1.2, 
									boxShadow: "0 0 20px rgba(255, 0, 0, 0.8)",
									background: "rgba(255, 0, 0, 0.4)"
								}}
								whileTap={{ scale: 0.9 }}
								aria-label="Close modal"
							>
								<svg
									width="28"
									height="28"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</motion.button>

							{/* Content - 2x larger text */}
							<div className="space-y-8">
								{/* Exercise name - very large */}
								<motion.h3
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
									className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-center"
									style={{ 
										fontFamily: "'Orbitron', sans-serif",
										color: "#00FFFF",
										textShadow: "0 0 20px rgba(0, 255, 255, 1), 0 0 40px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.4)",
									}}
								>
									{exercise}
								</motion.h3>

								{/* Divider */}
								<motion.div 
									className="h-1 bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent"
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ delay: 0.2, duration: 0.5 }}
									style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.8)" }}
								/>

								{/* Description - large text */}
								<motion.div 
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className="py-4"
								>
									<p className="text-2xl md:text-3xl leading-relaxed text-center" style={{
										fontFamily: "'Courier New', monospace",
										color: "#00FF00",
										textShadow: "0 0 15px rgba(0, 255, 0, 0.6)",
										lineHeight: "1.6",
									}}>
										{description || "No description available."}
									</p>
								</motion.div>

								{/* Close button - large */}
								<motion.div 
									className="flex justify-center pt-4"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
								>
									<motion.button
										onClick={onClose}
										className="px-12 py-4 rounded-lg text-xl font-bold uppercase tracking-wider"
										style={{
											fontFamily: "'Orbitron', sans-serif",
											background: "linear-gradient(135deg, #00FFFF 0%, #00BFFF 100%)",
											color: "#000",
											boxShadow: "0 0 30px rgba(0, 255, 255, 0.6)",
										}}
										whileHover={{ 
											scale: 1.05,
											boxShadow: "0 0 50px rgba(0, 255, 255, 0.9)"
										}}
										whileTap={{ scale: 0.95 }}
									>
										GOT IT!
									</motion.button>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
