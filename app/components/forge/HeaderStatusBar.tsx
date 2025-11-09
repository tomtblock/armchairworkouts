"use client";

import { motion } from "framer-motion";

interface HeaderStatusBarProps {
	status?: "online" | "offline";
	ready?: boolean;
}

export default function HeaderStatusBar({
	status = "online",
	ready = true,
}: HeaderStatusBarProps) {
	return (
		<div className="w-full px-4 py-2">
			<div className="flex items-center justify-center gap-3">
				{/* System Indicator */}
				<div className="flex items-center gap-2">
					<motion.div
						className="w-2 h-2 rounded-full"
						style={{
							background: status === "online" ? "#00FF00" : "#FF0000",
							boxShadow: status === "online" ? "0 0 10px rgba(0, 255, 0, 0.8)" : "0 0 10px rgba(255, 0, 0, 0.8)",
						}}
						animate={{
							opacity: status === "online" ? [1, 0.5, 1] : 0.3,
							scale: status === "online" ? [1, 1.2, 1] : 1,
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
					<span className="text-1 uppercase tracking-wider" style={{
						fontFamily: "'Courier New', monospace",
						color: "#00FF00",
						textShadow: "0 0 5px rgba(0, 255, 0, 0.5)",
					}}>
						SYSTEM {status.toUpperCase()}
					</span>
				</div>

				{/* Divider */}
				<div className="w-px h-4" style={{
					background: "#00FFFF",
					boxShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
				}} />

				{/* Ready Indicator */}
				<div className="flex items-center gap-2">
					<motion.div
						className="w-2 h-2 rounded-full"
						style={{
							background: ready ? "#00FF00" : "#FF0000",
							boxShadow: ready ? "0 0 10px rgba(0, 255, 0, 0.8)" : "0 0 10px rgba(255, 0, 0, 0.8)",
						}}
						animate={{
							opacity: ready ? [1, 0.5, 1] : 0.3,
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
					<span className="text-1 uppercase tracking-wider" style={{
						fontFamily: "'Courier New', monospace",
						color: ready ? "#00FF00" : "#FF0000",
						textShadow: ready ? "0 0 5px rgba(0, 255, 0, 0.5)" : "0 0 5px rgba(255, 0, 0, 0.5)",
					}}>
						READY
					</span>
				</div>
			</div>
		</div>
	);
}

