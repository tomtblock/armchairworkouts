"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface ActivateButtonProps {
	onActivate: () => void;
	disabled?: boolean;
}

export default function ActivateButton({ onActivate, disabled = false }: ActivateButtonProps) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [isHovered, setIsHovered] = useState(false);

	const playSound = () => {
		try {
			if (typeof window !== "undefined") {
				const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
				
				// Cyberpunk activation sound
				const now = audioContext.currentTime;
				
				// Bass thump
				const osc1 = audioContext.createOscillator();
				const gain1 = audioContext.createGain();
				osc1.connect(gain1);
				gain1.connect(audioContext.destination);
				osc1.type = "sine";
				osc1.frequency.setValueAtTime(80, now);
				osc1.frequency.exponentialRampToValueAtTime(40, now + 0.2);
				gain1.gain.setValueAtTime(0.4, now);
				gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
				osc1.start(now);
				osc1.stop(now + 0.2);
				
				// High synth sweep
				const osc2 = audioContext.createOscillator();
				const gain2 = audioContext.createGain();
				osc2.connect(gain2);
				gain2.connect(audioContext.destination);
				osc2.type = "sawtooth";
				osc2.frequency.setValueAtTime(200, now);
				osc2.frequency.exponentialRampToValueAtTime(800, now + 0.15);
				gain2.gain.setValueAtTime(0.15, now);
				gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
				osc2.start(now);
				osc2.stop(now + 0.2);
				
				// Digital blip
				const osc3 = audioContext.createOscillator();
				const gain3 = audioContext.createGain();
				osc3.connect(gain3);
				gain3.connect(audioContext.destination);
				osc3.type = "square";
				osc3.frequency.value = 1200;
				gain3.gain.setValueAtTime(0.1, now + 0.05);
				gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
				osc3.start(now + 0.05);
				osc3.stop(now + 0.1);
			}
		} catch (error) {
			console.debug("Audio not available:", error);
		}
	};

	const handleClick = () => {
		if (disabled) return;
		playSound();
		onActivate();
	};

	return (
		<div className="relative">
			{/* Outer glow rings */}
			{!disabled && (
				<>
					<motion.div
						className="absolute inset-0 rounded-lg"
						style={{
							background: "transparent",
							border: "2px solid rgba(0, 255, 255, 0.3)",
						}}
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.5, 0, 0.5],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeOut",
						}}
					/>
					<motion.div
						className="absolute inset-0 rounded-lg"
						style={{
							background: "transparent",
							border: "2px solid rgba(255, 0, 255, 0.3)",
						}}
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.4, 0, 0.4],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeOut",
							delay: 0.5,
						}}
					/>
				</>
			)}

			{/* Main Button */}
			<motion.button
				ref={buttonRef}
				onClick={handleClick}
				disabled={disabled}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className={`relative px-10 py-6 rounded-lg font-bold uppercase tracking-wider overflow-hidden ${
					disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
				}`}
				style={{
					fontFamily: "'Orbitron', sans-serif",
					fontSize: "1.5rem",
					background: disabled 
						? "linear-gradient(135deg, #1a1a2e 0%, #0a0a1a 100%)"
						: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)",
					border: disabled ? "3px solid #333" : "3px solid #00FFFF",
					color: disabled ? "#444" : "#00FFFF",
					boxShadow: disabled
						? "none"
						: "inset 0 0 30px rgba(0, 255, 255, 0.1), 0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3)",
					textShadow: disabled ? "none" : "0 0 20px rgba(0, 255, 255, 1), 0 0 40px rgba(0, 255, 255, 0.5)",
				}}
				animate={!disabled ? {
					borderColor: ["#00FFFF", "#FF00FF", "#00FFFF"],
					boxShadow: [
						"inset 0 0 30px rgba(0, 255, 255, 0.1), 0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3)",
						"inset 0 0 40px rgba(255, 0, 255, 0.15), 0 0 40px rgba(255, 0, 255, 0.6), 0 0 80px rgba(0, 255, 255, 0.4)",
						"inset 0 0 30px rgba(0, 255, 255, 0.1), 0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3)",
					],
				} : {}}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				whileHover={!disabled ? { 
					scale: 1.05,
					boxShadow: "inset 0 0 50px rgba(0, 255, 255, 0.2), 0 0 50px rgba(0, 255, 255, 0.8), 0 0 100px rgba(255, 0, 255, 0.5)",
				} : {}}
				whileTap={!disabled ? { scale: 0.95 } : {}}
			>
				{/* Scanning line effect */}
				{!disabled && (
					<motion.div
						className="absolute left-0 right-0 h-1"
						style={{
							background: "linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), rgba(255, 0, 255, 0.8), transparent)",
							boxShadow: "0 0 20px rgba(0, 255, 255, 0.8)",
						}}
						animate={{
							top: ["-10%", "110%"],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: "linear",
						}}
					/>
				)}

				{/* Glitch effect on hover */}
				{isHovered && !disabled && (
					<>
						<motion.div
							className="absolute inset-0 bg-cyan-500/10"
							animate={{
								x: [-3, 3, -3],
								opacity: [0, 0.5, 0],
							}}
							transition={{
								duration: 0.1,
								repeat: Infinity,
							}}
						/>
						<motion.div
							className="absolute inset-0 bg-magenta-500/10"
							animate={{
								x: [3, -3, 3],
								opacity: [0, 0.5, 0],
							}}
							transition={{
								duration: 0.1,
								repeat: Infinity,
								delay: 0.05,
							}}
						/>
					</>
				)}

				{/* Corner accents */}
				<div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-[#FF00FF]" />
				<div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-[#FF00FF]" />
				<div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-[#FF00FF]" />
				<div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-[#FF00FF]" />

				{/* Button text with icon */}
				<span className="relative z-10 flex items-center gap-3">
					<motion.span
						animate={!disabled ? {
							rotate: [0, 360],
						} : {}}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						⚡
					</motion.span>
					<span>ACTIVATE</span>
					<motion.span
						animate={!disabled ? {
							rotate: [360, 0],
						} : {}}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						⚡
					</motion.span>
				</span>
			</motion.button>

			{/* "SPIN AGAIN" encouragement text */}
			{!disabled && (
				<motion.div
					className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
					initial={{ opacity: 0 }}
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					<span className="text-xs font-mono" style={{
						color: "#FF00FF",
						textShadow: "0 0 10px rgba(255, 0, 255, 0.8)",
					}}>
						▼ TAP TO SPIN ▼
					</span>
				</motion.div>
			)}
		</div>
	);
}
