"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExerciseCompletionExplosionProps {
	isVisible: boolean;
	x: number;
	y: number;
	onComplete: () => void;
}

export default function ExerciseCompletionExplosion({
	isVisible,
	x,
	y,
	onComplete,
}: ExerciseCompletionExplosionProps) {
	const audioContextRef = useRef<AudioContext | null>(null);

	// Initialize audio
	useEffect(() => {
		if (typeof window !== "undefined" && isVisible) {
			audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
			playSound();
		}
		return () => {
			if (audioContextRef.current && audioContextRef.current.state !== "closed") {
				audioContextRef.current.close().catch(() => {});
			}
		};
	}, [isVisible]);

	const playSound = useCallback(() => {
		if (!audioContextRef.current) return;
		const ctx = audioContextRef.current;
		const now = ctx.currentTime;

		// Victory chime
		[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = "sine";
			osc.frequency.value = freq;
			gain.gain.setValueAtTime(0, now + i * 0.05);
			gain.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.3);
			osc.start(now + i * 0.05);
			osc.stop(now + i * 0.05 + 0.3);
		});
	}, []);

	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(onComplete, 800);
			return () => clearTimeout(timer);
		}
	}, [isVisible, onComplete]);

	if (!isVisible) return null;

	const particles = Array.from({ length: 20 }, (_, i) => ({
		id: i,
		angle: (i / 20) * Math.PI * 2,
		distance: 60 + Math.random() * 40,
		size: 4 + Math.random() * 8,
		color: ["#00FF00", "#00FFFF", "#FFD700", "#FF00FF"][Math.floor(Math.random() * 4)],
	}));

	const stars = Array.from({ length: 8 }, (_, i) => ({
		id: i,
		angle: (i / 8) * Math.PI * 2,
		distance: 40 + Math.random() * 30,
	}));

	return (
		<AnimatePresence>
			<div
				className="fixed pointer-events-none z-[100]"
				style={{
					left: x,
					top: y,
					transform: "translate(-50%, -50%)",
				}}
			>
				{/* Central burst */}
				<motion.div
					initial={{ scale: 0, opacity: 1 }}
					animate={{ scale: 3, opacity: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="absolute w-16 h-16 rounded-full"
					style={{
						left: "50%",
						top: "50%",
						transform: "translate(-50%, -50%)",
						background: "radial-gradient(circle, #00FF00 0%, transparent 70%)",
						boxShadow: "0 0 40px #00FF00",
					}}
				/>

				{/* Particles */}
				{particles.map((p) => (
					<motion.div
						key={p.id}
						initial={{
							x: 0,
							y: 0,
							scale: 1,
							opacity: 1,
						}}
						animate={{
							x: Math.cos(p.angle) * p.distance,
							y: Math.sin(p.angle) * p.distance,
							scale: 0,
							opacity: 0,
						}}
						transition={{ duration: 0.6, ease: "easeOut" }}
						className="absolute rounded-full"
						style={{
							width: p.size,
							height: p.size,
							background: p.color,
							boxShadow: `0 0 10px ${p.color}`,
							left: "50%",
							top: "50%",
							marginLeft: -p.size / 2,
							marginTop: -p.size / 2,
						}}
					/>
				))}

				{/* Stars */}
				{stars.map((s) => (
					<motion.div
						key={`star-${s.id}`}
						initial={{
							x: 0,
							y: 0,
							scale: 0,
							opacity: 1,
							rotate: 0,
						}}
						animate={{
							x: Math.cos(s.angle) * s.distance,
							y: Math.sin(s.angle) * s.distance,
							scale: [0, 1.5, 0],
							opacity: [1, 1, 0],
							rotate: 180,
						}}
						transition={{ duration: 0.7, ease: "easeOut" }}
						className="absolute text-2xl"
						style={{
							left: "50%",
							top: "50%",
							marginLeft: -10,
							marginTop: -10,
						}}
					>
						⭐
					</motion.div>
				))}

				{/* Checkmark */}
				<motion.div
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="absolute text-4xl"
					style={{
						left: "50%",
						top: "50%",
						transform: "translate(-50%, -50%)",
						filter: "drop-shadow(0 0 10px #00FF00)",
					}}
				>
					✅
				</motion.div>
			</div>
		</AnimatePresence>
	);
}

