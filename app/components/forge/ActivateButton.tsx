"use client";

import { motion } from "framer-motion";

interface ActivateButtonProps {
	onActivate: () => void;
	disabled?: boolean;
}

export default function ActivateButton({ onActivate, disabled = false }: ActivateButtonProps) {
	const playSound = () => {
		try {
			if (typeof window !== "undefined") {
				const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
				const oscillator = audioContext.createOscillator();
				const gainNode = audioContext.createGain();
				
				oscillator.connect(gainNode);
				gainNode.connect(audioContext.destination);
				
				// Activation sound
				oscillator.frequency.value = 400;
				oscillator.type = "square";
				gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
				gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
				
				oscillator.start(audioContext.currentTime);
				oscillator.stop(audioContext.currentTime + 0.2);
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
		<motion.button
			onClick={handleClick}
			disabled={disabled}
			className={`relative px-8 py-6 rounded-lg font-bold uppercase tracking-wider transition-all ${
				disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
			} ${!disabled ? "pulse-glow" : ""}`}
			style={{
				fontFamily: "'Orbitron', sans-serif",
				fontSize: "1.25rem",
				background: disabled 
					? "linear-gradient(135deg, #4a1a1a 0%, #2a0a0a 100%)"
					: "linear-gradient(135deg, #FF0000 0%, #CC0000 50%, #990000 100%)",
				border: "3px solid #FF0000",
				color: "#FFFFFF",
				boxShadow: disabled
					? "inset 0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.5)"
					: "inset 0 2px 4px rgba(255,255,255,0.2), 0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.5), 0 4px 8px rgba(0,0,0,0.8)",
				textShadow: "0 0 10px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0,0,0,0.8)",
			}}
			whileHover={!disabled ? { scale: 1.05 } : {}}
			whileTap={!disabled ? { scale: 0.95 } : {}}
			animate={!disabled ? {
				boxShadow: [
					"inset 0 2px 4px rgba(255,255,255,0.2), 0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.5), 0 4px 8px rgba(0,0,0,0.8)",
					"inset 0 2px 4px rgba(255,255,255,0.2), 0 0 40px rgba(255, 0, 0, 1), 0 0 80px rgba(255, 0, 0, 0.7), 0 4px 8px rgba(0,0,0,0.8)",
					"inset 0 2px 4px rgba(255,255,255,0.2), 0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.5), 0 4px 8px rgba(0,0,0,0.8)",
				],
			} : {}}
			transition={{
				duration: 2,
				repeat: Infinity,
				ease: "easeInOut",
			}}
		>
			ACTIVATE
		</motion.button>
	);
}

