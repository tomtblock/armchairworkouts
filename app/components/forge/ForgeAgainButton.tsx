"use client";

import { motion } from "framer-motion";

interface ForgeAgainButtonProps {
	onClick: () => void;
	visible: boolean;
}

export default function ForgeAgainButton({
	onClick,
	visible,
}: ForgeAgainButtonProps) {
	if (!visible) return null;

	return (
		<motion.button
			className="px-8 py-4 bg-gradient-to-b from-amber-500/20 to-amber-600/20 border-2 border-amber-500 rounded-2xl font-mono uppercase tracking-wider text-amber-400 font-bold text-lg shadow-[0_0_30px_rgba(255,179,0,0.4),inset_0_2px_4px_rgba(255,179,0,0.2)] relative overflow-hidden"
			onClick={onClick}
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
		>
			{/* Pulse Glow Effect */}
			<motion.div
				className="absolute inset-0 bg-amber-500/20"
				animate={{
					opacity: [0.3, 0.6, 0.3],
					scale: [1, 1.1, 1],
				}}
				transition={{
					duration: 1,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Text */}
			<span className="relative z-10">FORGE AGAIN</span>

			{/* Shine Effect */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
				animate={{
					x: ["-100%", "200%"],
				}}
				transition={{
					duration: 2,
					repeat: Infinity,
					repeatDelay: 1,
					ease: "linear",
				}}
			/>
		</motion.button>
	);
}

