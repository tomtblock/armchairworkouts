"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface LeverButtonProps {
	onPull: () => void;
	disabled?: boolean;
}

export default function LeverButton({ onPull, disabled = false }: LeverButtonProps) {
	const [isPulling, setIsPulling] = useState(false);

	const playSound = () => {
		try {
			// Create audio context for sound effect (clang sound)
			if (typeof window !== "undefined") {
				const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
				const oscillator = audioContext.createOscillator();
				const gainNode = audioContext.createGain();
				
				oscillator.connect(gainNode);
				gainNode.connect(audioContext.destination);
				
				// Metallic clang sound
				oscillator.frequency.value = 300;
				oscillator.type = "square";
				gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
				gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
				
				oscillator.start(audioContext.currentTime);
				oscillator.stop(audioContext.currentTime + 0.15);
			}
		} catch (error) {
			// Silently fail if audio is not supported
			console.debug("Audio not available:", error);
		}
	};

	const handleMouseDown = () => {
		if (disabled) return;
		setIsPulling(true);
		playSound();
	};

	const handleMouseUp = () => {
		if (disabled) return;
		setIsPulling(false);
		onPull();
		// Haptic feedback would go here if supported
	};

	const handleTouchStart = () => {
		if (disabled) return;
		setIsPulling(true);
	};

	const handleTouchEnd = () => {
		if (disabled) return;
		setIsPulling(false);
		onPull();
	};

	return (
		<div className="flex flex-col items-center justify-center h-full gap-4">
			<motion.button
				className={`relative w-20 h-48 rounded-2xl cursor-pointer active:cursor-grabbing disabled:opacity-50 disabled:cursor-not-allowed ${!disabled ? "pulse-glow" : ""}`}
				style={{
					background: "linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)",
					border: "3px solid #00FFFF",
					boxShadow: disabled 
						? "inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(0,0,0,0.4), 0 0 10px rgba(0,0,0,0.5)"
						: "inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(0,0,0,0.4), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
				}}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseLeave={() => setIsPulling(false)}
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
				disabled={disabled}
				animate={{
					y: isPulling ? 30 : 0,
					scale: isPulling ? 0.95 : 1,
				}}
				transition={{
					type: "spring",
					stiffness: 300,
					damping: 20,
				}}
				whileHover={!disabled ? { scale: 1.05 } : {}}
				whileTap={!disabled ? { scale: 0.9 } : {}}
			>
				{/* Neon Accent Strips */}
				<div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full" style={{
					background: "#00FFFF",
					boxShadow: "0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)",
				}} />
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full" style={{
					background: "#00FFFF",
					boxShadow: "0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)",
				}} />
				
				{/* Metallic Lever Handle */}
				<div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full" style={{
					background: "radial-gradient(circle, #00FFFF 0%, #0080FF 100%)",
					border: "2px solid #00FFFF",
					boxShadow: "0 0 15px rgba(0, 255, 255, 0.8), inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.5)",
				}} />
				
				{/* Lever Body Pattern - Neon Stripe */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-full h-1/3" style={{
						background: "linear-gradient(to bottom, transparent 0%, rgba(0, 255, 255, 0.1) 50%, transparent 100%)",
					}} />
				</div>

				{/* Pull Indicator */}
				{!disabled && (
					<motion.div
						className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-2 uppercase tracking-wider whitespace-nowrap"
						style={{
							fontFamily: "'Orbitron', sans-serif",
							color: "#00FFFF",
							textShadow: "0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)",
						}}
						animate={{
							opacity: [0.5, 1, 0.5],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
						}}
					>
						PULL THIS LEVER
					</motion.div>
				)}
			</motion.button>
		</div>
	);
}

