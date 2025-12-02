"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WorkoutResult } from "@/app/lib/workoutRandomizer";

interface PackOpeningAnimationProps {
	workouts: WorkoutResult[];
	isOpen: boolean;
	onComplete: () => void;
	onClose: () => void;
}

// Rarity colors based on workout type
const getRarityColor = (type: string) => {
	const rarities: Record<string, { bg: string; glow: string; name: string; emoji: string }> = {
		upper: { bg: "from-blue-500 to-cyan-400", glow: "#00BFFF", name: "UPPER", emoji: "💪" },
		lower: { bg: "from-purple-500 to-pink-400", glow: "#FF00FF", name: "LOWER", emoji: "🦵" },
		core: { bg: "from-yellow-400 to-orange-500", glow: "#FFD700", name: "CORE", emoji: "🔥" },
		cardio: { bg: "from-red-500 to-orange-400", glow: "#FF4500", name: "CARDIO", emoji: "❤️" },
		full: { bg: "from-emerald-400 to-teal-500", glow: "#00FF7F", name: "FULL BODY", emoji: "⚡" },
	};
	return rarities[type?.toLowerCase()] || { bg: "from-gray-400 to-gray-600", glow: "#CCCCCC", name: "WORKOUT", emoji: "💥" };
};

interface Particle {
	id: string;
	x: number;
	y: number;
	color: string;
	size: number;
	type: 'circle' | 'star' | 'spark' | 'ring';
	delay: number;
}

export default function PackOpeningAnimation({
	workouts,
	isOpen,
	onComplete,
}: PackOpeningAnimationProps) {
	const [particles, setParticles] = useState<Particle[]>([]);
	const [shockwaves, setShockwaves] = useState<{ id: string; delay: number }[]>([]);
	const [lightBeams, setLightBeams] = useState<{ id: string; angle: number; color: string }[]>([]);
	const audioContextRef = useRef<AudioContext | null>(null);
	const particleCounter = useRef(0);

	// Initialize audio context
	useEffect(() => {
		if (typeof window !== "undefined") {
			audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
		}
		return () => {
			if (audioContextRef.current && audioContextRef.current.state !== "closed") {
				audioContextRef.current.close().catch(() => {});
			}
		};
	}, []);

	// Play EPIC burst sound
	const playBurstSound = useCallback(() => {
		if (!audioContextRef.current) return;
		const ctx = audioContextRef.current;
		const now = ctx.currentTime;

		// BIG explosion noise
		const noise = ctx.createBufferSource();
		const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < buffer.length; i++) {
			data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
		}
		noise.buffer = buffer;
		const noiseGain = ctx.createGain();
		noiseGain.gain.value = 0.5;
		noise.connect(noiseGain);
		noiseGain.connect(ctx.destination);
		noise.start(now);

		// Deep bass hit
		const bass = ctx.createOscillator();
		const bassGain = ctx.createGain();
		bass.connect(bassGain);
		bassGain.connect(ctx.destination);
		bass.type = "sine";
		bass.frequency.setValueAtTime(80, now);
		bass.frequency.exponentialRampToValueAtTime(20, now + 0.3);
		bassGain.gain.setValueAtTime(0.5, now);
		bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
		bass.start(now);
		bass.stop(now + 0.5);

		// Victory chord - rising
		[261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const oscGain = ctx.createGain();
			osc.connect(oscGain);
			oscGain.connect(ctx.destination);
			osc.type = "triangle";
			osc.frequency.value = freq;
			oscGain.gain.setValueAtTime(0, now + i * 0.05);
			oscGain.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.05);
			oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
			osc.start(now + i * 0.05);
			osc.stop(now + 0.7);
		});

		// Shimmering high frequency sweep
		const shimmer = ctx.createOscillator();
		const shimmerGain = ctx.createGain();
		shimmer.connect(shimmerGain);
		shimmerGain.connect(ctx.destination);
		shimmer.type = "sine";
		shimmer.frequency.setValueAtTime(2000, now);
		shimmer.frequency.exponentialRampToValueAtTime(4000, now + 0.2);
		shimmerGain.gain.setValueAtTime(0.1, now);
		shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
		shimmer.start(now);
		shimmer.stop(now + 0.3);
	}, []);

	// Create MASSIVE particle burst
	const createParticleBurst = useCallback(() => {
		const colors = ["#FFD700", "#FF00FF", "#00FFFF", "#FF4500", "#00FF7F", "#FFFFFF", "#FF1493", "#7B68EE"];
		const types: Particle['type'][] = ['circle', 'star', 'spark', 'ring'];
		
		// Main explosion - 100 particles
		const newParticles: Particle[] = Array.from({ length: 100 }, (_, i) => {
			particleCounter.current += 1;
			return {
				id: `p-${particleCounter.current}-${Math.random().toString(36).substr(2, 5)}`,
				x: 50 + (Math.random() - 0.5) * 20,
				y: 50 + (Math.random() - 0.5) * 20,
				color: colors[Math.floor(Math.random() * colors.length)],
				size: 4 + Math.random() * 12,
				type: types[Math.floor(Math.random() * types.length)],
				delay: Math.random() * 0.2,
			};
		});

		// Secondary burst - edges
		const edgeParticles: Particle[] = Array.from({ length: 40 }, (_, i) => {
			particleCounter.current += 1;
			const angle = (i / 40) * Math.PI * 2;
			return {
				id: `ep-${particleCounter.current}-${Math.random().toString(36).substr(2, 5)}`,
				x: 50 + Math.cos(angle) * 15,
				y: 50 + Math.sin(angle) * 15,
				color: colors[Math.floor(Math.random() * colors.length)],
				size: 6 + Math.random() * 10,
				type: 'spark',
				delay: 0.1 + Math.random() * 0.15,
			};
		});

		setParticles([...newParticles, ...edgeParticles]);
		setTimeout(() => setParticles([]), 2000);

		// Create shockwaves
		setShockwaves([
			{ id: 'sw1', delay: 0 },
			{ id: 'sw2', delay: 0.1 },
			{ id: 'sw3', delay: 0.2 },
		]);
		setTimeout(() => setShockwaves([]), 1500);

		// Create light beams
		const beams = Array.from({ length: 12 }, (_, i) => ({
			id: `beam-${i}`,
			angle: (i / 12) * 360,
			color: colors[i % colors.length],
		}));
		setLightBeams(beams);
		setTimeout(() => setLightBeams([]), 1500);
	}, []);

	// Trigger effects on open
	useEffect(() => {
		if (isOpen && workouts.length > 0) {
			playBurstSound();
			createParticleBurst();
		}
	}, [isOpen, workouts.length, playBurstSound, createParticleBurst]);

	if (!isOpen || workouts.length === 0) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
				className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
				style={{
					background: "radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0a 70%, #000000 100%)",
				}}
				onClick={onComplete}
			>
				{/* Background energy pulse */}
				<motion.div
					className="absolute inset-0"
					initial={{ opacity: 0 }}
					animate={{ opacity: [0, 0.3, 0] }}
					transition={{ duration: 0.5 }}
					style={{
						background: "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.4) 0%, transparent 70%)",
					}}
				/>

				{/* Light beams radiating from center */}
				{lightBeams.map((beam) => (
					<motion.div
						key={beam.id}
						className="absolute w-2 origin-bottom"
						style={{
							left: "50%",
							bottom: "50%",
							height: "100vh",
							background: `linear-gradient(to top, ${beam.color} 0%, transparent 100%)`,
							transform: `translateX(-50%) rotate(${beam.angle}deg)`,
							opacity: 0.6,
						}}
						initial={{ scaleY: 0, opacity: 0 }}
						animate={{ scaleY: [0, 1, 0], opacity: [0, 0.6, 0] }}
						transition={{ duration: 0.8, ease: "easeOut" }}
					/>
				))}

				{/* Shockwaves */}
				{shockwaves.map((sw) => (
					<motion.div
						key={sw.id}
						className="absolute rounded-full border-4 border-white pointer-events-none"
						style={{
							left: "50%",
							top: "50%",
							transform: "translate(-50%, -50%)",
						}}
						initial={{ width: 0, height: 0, opacity: 1 }}
						animate={{ 
							width: ["0px", "150vw"], 
							height: ["0px", "150vh"], 
							opacity: [1, 0],
							borderColor: ["#FFFFFF", "#FFD700", "#00FFFF"]
						}}
						transition={{ duration: 1, delay: sw.delay, ease: "easeOut" }}
					/>
				))}

				{/* Particles - different shapes */}
				{particles.map((particle) => (
					<motion.div
						key={particle.id}
						className="absolute pointer-events-none"
						style={{
							left: `${particle.x}%`,
							top: `${particle.y}%`,
							width: particle.size,
							height: particle.size,
							background: particle.type === 'ring' ? 'transparent' : particle.color,
							border: particle.type === 'ring' ? `3px solid ${particle.color}` : 'none',
							borderRadius: particle.type === 'star' ? '2px' : '50%',
							boxShadow: `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${particle.size * 4}px ${particle.color}50`,
							transform: particle.type === 'star' ? 'rotate(45deg)' : 'none',
						}}
						initial={{ scale: 0, opacity: 1 }}
						animate={{
							scale: [0, 2, 0],
							opacity: [1, 1, 0],
							x: (Math.random() - 0.5) * 800,
							y: (Math.random() - 0.5) * 800,
							rotate: particle.type === 'star' ? [45, 405] : 0,
						}}
						transition={{ 
							duration: 1.2 + Math.random() * 0.5, 
							delay: particle.delay,
							ease: "easeOut" 
						}}
					/>
				))}

				{/* Sparkle overlay */}
				{Array.from({ length: 30 }).map((_, i) => (
					<motion.div
						key={`sparkle-${i}`}
						className="absolute text-2xl pointer-events-none"
						style={{
							left: `${10 + Math.random() * 80}%`,
							top: `${10 + Math.random() * 80}%`,
						}}
						initial={{ opacity: 0, scale: 0 }}
						animate={{ 
							opacity: [0, 1, 0],
							scale: [0, 1.5, 0],
							rotate: [0, 180]
						}}
						transition={{ 
							duration: 0.8,
							delay: 0.2 + Math.random() * 0.4,
							ease: "easeOut"
						}}
					>
						✨
					</motion.div>
				))}

				{/* Cards Display - MUCH BIGGER - with padding for button */}
				<div className="relative z-10 flex flex-wrap justify-center gap-6 max-w-6xl px-4 pb-32 pt-8 overflow-y-auto max-h-[80vh]">
					{workouts.map((workout, index) => {
						const rarity = getRarityColor(workout.type);
						return (
							<motion.div
								key={index}
								initial={{ scale: 0, rotateY: 180, opacity: 0, y: -100 }}
								animate={{ scale: 1, rotateY: 0, opacity: 1, y: 0 }}
								transition={{
									type: "spring",
									stiffness: 200,
									damping: 15,
									delay: index * 0.15,
								}}
								className="relative cursor-pointer"
								style={{ 
									perspective: "1000px",
									width: "280px",
									height: "380px",
								}}
							>
								{/* Card glow effect */}
								<motion.div
									className="absolute inset-0 rounded-2xl"
									style={{
										background: `radial-gradient(circle at 50% 50%, ${rarity.glow}40 0%, transparent 70%)`,
									}}
									animate={{
										scale: [1, 1.2, 1],
										opacity: [0.5, 1, 0.5],
									}}
									transition={{ duration: 1.5, repeat: Infinity }}
								/>

								{/* Card */}
								<motion.div
									className={`w-full h-full rounded-2xl bg-gradient-to-br ${rarity.bg} p-1.5`}
									style={{
										boxShadow: `0 0 50px ${rarity.glow}, 0 0 100px ${rarity.glow}60, 0 0 150px ${rarity.glow}30`,
									}}
									animate={{
										boxShadow: [
											`0 0 50px ${rarity.glow}, 0 0 100px ${rarity.glow}60`,
											`0 0 80px ${rarity.glow}, 0 0 150px ${rarity.glow}80`,
											`0 0 50px ${rarity.glow}, 0 0 100px ${rarity.glow}60`,
										]
									}}
									transition={{ duration: 2, repeat: Infinity }}
								>
									<div className="w-full h-full bg-black/90 rounded-xl p-5 flex flex-col relative overflow-hidden">
										{/* Shine effect */}
										<motion.div
											className="absolute inset-0 opacity-30"
											style={{
												background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
											}}
											initial={{ x: "-100%", y: "-100%" }}
											animate={{ x: "200%", y: "200%" }}
											transition={{ duration: 1.5, delay: index * 0.15 + 0.3 }}
										/>

										{/* Type Badge - larger */}
										<motion.div
											className="text-lg font-bold text-center py-2 px-4 rounded-lg mb-3"
											style={{
												background: `${rarity.glow}30`,
												color: rarity.glow,
												textShadow: `0 0 15px ${rarity.glow}`,
												fontFamily: "'Orbitron', sans-serif",
											}}
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ delay: index * 0.15 + 0.2, type: "spring" }}
										>
											{rarity.emoji} {rarity.name}
										</motion.div>

										{/* Workout Name - much larger */}
										<motion.div
											className="text-2xl font-bold text-center mb-4 flex-grow flex items-center justify-center px-2"
											style={{
												color: "#FFFFFF",
												fontFamily: "'Orbitron', sans-serif",
												textShadow: "0 0 20px rgba(255,255,255,0.5)",
												lineHeight: "1.2",
											}}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.15 + 0.3 }}
										>
											{workout.workout}
										</motion.div>

										{/* Stats - larger */}
										<motion.div 
											className="space-y-2 text-lg"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: index * 0.15 + 0.4 }}
										>
											<div className="flex justify-between items-center text-gray-300 bg-white/5 rounded-lg px-3 py-2">
												<span className="font-semibold">Sets:</span>
												<span className="font-bold text-2xl text-white" style={{ textShadow: `0 0 10px ${rarity.glow}` }}>
													{workout.sets}
												</span>
											</div>
											<div className="flex justify-between items-center text-gray-300 bg-white/5 rounded-lg px-3 py-2">
												<span className="font-semibold">Reps:</span>
												<span className="font-bold text-2xl text-white" style={{ textShadow: `0 0 10px ${rarity.glow}` }}>
													{workout.amount}
												</span>
											</div>
											<div className="flex justify-between items-center text-gray-300 bg-white/5 rounded-lg px-3 py-2">
												<span className="font-semibold">Time:</span>
												<span className="font-bold text-xl text-white" style={{ textShadow: `0 0 10px ${rarity.glow}` }}>
													{workout.repsTime}
												</span>
											</div>
										</motion.div>
									</div>
								</motion.div>
							</motion.div>
						);
					})}
				</div>

				{/* EPIC Continue Button */}
				<motion.button
					initial={{ opacity: 0, y: 50, scale: 0.5 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ 
						delay: workouts.length * 0.15 + 0.5,
						type: "spring",
						stiffness: 200
					}}
					onClick={(e) => {
						e.stopPropagation();
						onComplete();
					}}
					className="absolute bottom-12 px-12 py-5 rounded-xl font-bold text-2xl"
					style={{
						background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)",
						color: "#000",
						fontFamily: "'Orbitron', sans-serif",
						boxShadow: "0 0 40px rgba(255, 215, 0, 0.7), 0 0 80px rgba(255, 215, 0, 0.4)",
					}}
				>
					<motion.span
						animate={{ 
							textShadow: [
								"0 0 10px rgba(0,0,0,0.5)",
								"0 0 20px rgba(0,0,0,0.8)",
								"0 0 10px rgba(0,0,0,0.5)",
							]
						}}
						transition={{ duration: 1, repeat: Infinity }}
					>
						🔥 START WORKOUT 🔥
					</motion.span>
				</motion.button>

				{/* Skip hint */}
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.6 }}
					transition={{ delay: 1.5 }}
					className="absolute bottom-4 text-gray-400 text-base"
				>
					Click anywhere to continue
				</motion.p>
			</motion.div>
		</AnimatePresence>
	);
}
