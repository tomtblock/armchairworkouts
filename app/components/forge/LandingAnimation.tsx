"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, createTimeline } from "@/lib/anime";

interface LandingAnimationProps {
	onComplete: () => void;
	skipable?: boolean;
}

export default function LandingAnimation({ onComplete, skipable = true }: LandingAnimationProps) {
	const [phase, setPhase] = useState<"couch" | "getup" | "workout" | "transform" | "robot" | "complete">("couch");
	const [showSkip, setShowSkip] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const audioContextRef = useRef<AudioContext | null>(null);

	console.log("🎬 LandingAnimation rendered, phase:", phase);

	// Initialize audio
	useEffect(() => {
		console.log("🎬 LandingAnimation mounted!");
		if (typeof window !== "undefined") {
			audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
		}
		return () => {
			if (audioContextRef.current && audioContextRef.current.state !== "closed") {
				audioContextRef.current.close().catch(() => {});
			}
		};
	}, []);

	// Play sound effect
	const playSound = (type: "getup" | "workout" | "transform" | "robot") => {
		if (!audioContextRef.current) return;
		const ctx = audioContextRef.current;
		const now = ctx.currentTime;

		if (type === "getup") {
			// Whoosh sound
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = "sine";
			osc.frequency.setValueAtTime(200, now);
			osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
			gain.gain.setValueAtTime(0.1, now);
			gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
			osc.start(now);
			osc.stop(now + 0.3);
		} else if (type === "workout") {
			// Energetic beep
			[400, 500, 600].forEach((freq, i) => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.type = "square";
				osc.frequency.value = freq;
				gain.gain.setValueAtTime(0.1, now + i * 0.1);
				gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);
				osc.start(now + i * 0.1);
				osc.stop(now + i * 0.1 + 0.1);
			});
		} else if (type === "transform") {
			// Electric transformation sound
			const noise = ctx.createBufferSource();
			const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
			const data = buffer.getChannelData(0);
			for (let i = 0; i < buffer.length; i++) {
				data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.01) * Math.exp(-i / (ctx.sampleRate * 0.2));
			}
			noise.buffer = buffer;
			const filter = ctx.createBiquadFilter();
			filter.type = "bandpass";
			filter.frequency.value = 2000;
			filter.Q.value = 5;
			const gain = ctx.createGain();
			gain.gain.value = 0.3;
			noise.connect(filter);
			filter.connect(gain);
			gain.connect(ctx.destination);
			noise.start(now);
		} else if (type === "robot") {
			// Robot activation sound
			[200, 400, 800, 1600].forEach((freq, i) => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.type = "sawtooth";
				osc.frequency.value = freq;
				gain.gain.setValueAtTime(0, now + i * 0.15);
				gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05);
				gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
				osc.start(now + i * 0.15);
				osc.stop(now + i * 0.15 + 0.3);
			});
		}
	};

	// Animation sequence
	useEffect(() => {
		const timer1 = setTimeout(() => setShowSkip(true), 1000);
		
		const sequence = async () => {
			// Phase 1: Person on couch (2s)
			await new Promise(r => setTimeout(r, 2000));
			
			// Phase 2: Get up (1.5s)
			playSound("getup");
			setPhase("getup");
			await new Promise(r => setTimeout(r, 1500));
			
			// Phase 3: Start working out (2s)
			playSound("workout");
			setPhase("workout");
			await new Promise(r => setTimeout(r, 2000));
			
			// Phase 4: Transform (1.5s)
			playSound("transform");
			setPhase("transform");
			await new Promise(r => setTimeout(r, 1500));
			
			// Phase 5: Robot (2s)
			playSound("robot");
			setPhase("robot");
			await new Promise(r => setTimeout(r, 2500));
			
			// Complete
			setPhase("complete");
			setTimeout(onComplete, 500);
		};

		sequence();

		return () => {
			clearTimeout(timer1);
		};
	}, [onComplete]);

	// Particle effect for transformation
	const TransformParticles = () => (
		<div className="absolute inset-0 pointer-events-none overflow-hidden">
			{[...Array(30)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute w-2 h-2 rounded-full"
					style={{
						left: "50%",
						top: "50%",
						background: i % 2 === 0 ? "#00FFFF" : "#FF00FF",
						boxShadow: `0 0 10px ${i % 2 === 0 ? "#00FFFF" : "#FF00FF"}`,
					}}
					initial={{ scale: 0, x: 0, y: 0 }}
					animate={{
						scale: [0, 1, 0],
						x: Math.cos((i / 30) * Math.PI * 2) * 200,
						y: Math.sin((i / 30) * Math.PI * 2) * 200,
					}}
					transition={{ duration: 1, delay: i * 0.02 }}
				/>
			))}
		</div>
	);

	return (
		<AnimatePresence>
			{phase !== "complete" && (
				<motion.div
					ref={containerRef}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
					style={{
						background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
					}}
				>
					{/* Background grid */}
					<div 
						className="absolute inset-0 opacity-20"
						style={{
							backgroundImage: `
								linear-gradient(#00FFFF10 1px, transparent 1px),
								linear-gradient(90deg, #00FFFF10 1px, transparent 1px)
							`,
							backgroundSize: "50px 50px",
						}}
					/>

					{/* Living room floor */}
					<div 
						className="absolute bottom-0 left-0 right-0 h-1/3"
						style={{
							background: "linear-gradient(180deg, transparent 0%, #1a0a2e40 100%)",
						}}
					/>

					{/* Main scene container */}
					<div className="relative w-full max-w-3xl h-96">
						
						{/* COUCH - Always visible in background */}
						<motion.div
							className="absolute bottom-8 left-1/2 -translate-x-1/2"
							animate={{
								opacity: phase === "robot" ? 0.3 : 1,
								scale: phase === "robot" ? 0.8 : 1,
							}}
						>
							{/* Couch SVG */}
							<svg width="300" height="120" viewBox="0 0 300 120">
								{/* Couch back */}
								<rect x="20" y="20" width="260" height="60" rx="15" fill="#4a3728" />
								<rect x="25" y="25" width="250" height="50" rx="12" fill="#5d4632" />
								
								{/* Couch seat */}
								<rect x="10" y="70" width="280" height="35" rx="10" fill="#4a3728" />
								<rect x="15" y="75" width="270" height="25" rx="8" fill="#6b4f3a" />
								
								{/* Cushions */}
								<ellipse cx="80" cy="85" rx="45" ry="15" fill="#7d5a42" />
								<ellipse cx="150" cy="85" rx="45" ry="15" fill="#8b6547" />
								<ellipse cx="220" cy="85" rx="45" ry="15" fill="#7d5a42" />
								
								{/* Legs */}
								<rect x="30" y="105" width="15" height="15" rx="3" fill="#3d2d1f" />
								<rect x="255" y="105" width="15" height="15" rx="3" fill="#3d2d1f" />
							</svg>
						</motion.div>

						{/* HUMAN CHARACTER */}
						<AnimatePresence>
							{(phase === "couch" || phase === "getup" || phase === "workout") && (
								<motion.div
									className="absolute bottom-8 left-1/2"
									initial={{ x: "-50%", y: 0 }}
									animate={{
										x: phase === "couch" ? "-50%" : phase === "getup" ? "-30%" : "0%",
										y: phase === "couch" ? -20 : phase === "getup" ? -40 : -60,
										rotate: phase === "workout" ? [0, -5, 5, -5, 5, 0] : 0,
									}}
									exit={{ opacity: 0, scale: 0.5 }}
									transition={{ 
										duration: 0.5,
										rotate: { repeat: Infinity, duration: 0.5 }
									}}
								>
									{/* Human SVG */}
									<svg width="100" height="180" viewBox="0 0 100 180">
										{/* Head */}
										<circle cx="50" cy="25" r="20" fill="#FFD5B8" />
										<circle cx="43" cy="22" r="3" fill="#333" /> {/* Left eye */}
										<circle cx="57" cy="22" r="3" fill="#333" /> {/* Right eye */}
										<path d="M45 32 Q50 37 55 32" stroke="#333" strokeWidth="2" fill="none" /> {/* Smile */}
										<ellipse cx="50" cy="8" rx="18" ry="8" fill="#4a3728" /> {/* Hair */}
										
										{/* Body */}
										<rect x="35" y="45" width="30" height="50" rx="5" fill={phase === "workout" ? "#FF4444" : "#6B7DB3"} />
										
										{/* Arms */}
										<motion.g
											animate={{
												rotate: phase === "workout" ? [0, -45, 0, 45, 0] : 
														phase === "couch" ? 20 : 0,
											}}
											transition={{ repeat: phase === "workout" ? Infinity : 0, duration: 0.3 }}
											style={{ transformOrigin: "35px 55px" }}
										>
											<rect x="15" y="50" width="20" height="10" rx="5" fill="#FFD5B8" />
											<circle cx="15" cy="55" r="8" fill="#FFD5B8" />
										</motion.g>
										<motion.g
											animate={{
												rotate: phase === "workout" ? [0, 45, 0, -45, 0] : 
														phase === "couch" ? -20 : 0,
											}}
											transition={{ repeat: phase === "workout" ? Infinity : 0, duration: 0.3 }}
											style={{ transformOrigin: "65px 55px" }}
										>
											<rect x="65" y="50" width="20" height="10" rx="5" fill="#FFD5B8" />
											<circle cx="85" cy="55" r="8" fill="#FFD5B8" />
										</motion.g>
										
										{/* Legs */}
										<motion.g
											animate={{
												scaleY: phase === "workout" ? [1, 0.8, 1] : 1,
											}}
											transition={{ repeat: phase === "workout" ? Infinity : 0, duration: 0.3 }}
										>
											<rect x="35" y="95" width="12" height="50" rx="5" fill="#3D4F7C" />
											<rect x="53" y="95" width="12" height="50" rx="5" fill="#3D4F7C" />
											{/* Feet */}
											<ellipse cx="41" cy="150" rx="10" ry="5" fill="#333" />
											<ellipse cx="59" cy="150" rx="10" ry="5" fill="#333" />
										</motion.g>
									</svg>
								</motion.div>
							)}
						</AnimatePresence>

						{/* TRANSFORMATION EFFECT */}
						{phase === "transform" && (
							<>
								<TransformParticles />
								<motion.div
									className="absolute bottom-8 left-1/2 -translate-x-1/2"
									initial={{ opacity: 1 }}
									animate={{ 
										opacity: [1, 0.5, 1, 0.3, 1],
										filter: ["hue-rotate(0deg)", "hue-rotate(180deg)", "hue-rotate(360deg)"],
									}}
									transition={{ duration: 1.5 }}
								>
									{/* Glitchy human-robot hybrid */}
									<svg width="100" height="180" viewBox="0 0 100 180" className="animate-pulse">
										<defs>
											<linearGradient id="transformGrad" x1="0%" y1="0%" x2="100%" y2="100%">
												<stop offset="0%" stopColor="#FFD5B8" />
												<stop offset="50%" stopColor="#00FFFF" />
												<stop offset="100%" stopColor="#888899" />
											</linearGradient>
										</defs>
										<circle cx="50" cy="25" r="20" fill="url(#transformGrad)" />
										<rect x="35" y="45" width="30" height="50" rx="5" fill="url(#transformGrad)" />
										<rect x="15" y="50" width="20" height="10" rx="5" fill="url(#transformGrad)" />
										<rect x="65" y="50" width="20" height="10" rx="5" fill="url(#transformGrad)" />
										<rect x="35" y="95" width="12" height="50" rx="5" fill="url(#transformGrad)" />
										<rect x="53" y="95" width="12" height="50" rx="5" fill="url(#transformGrad)" />
									</svg>
								</motion.div>

								{/* Electric bolts */}
								{[...Array(8)].map((_, i) => (
									<motion.div
										key={i}
										className="absolute"
										style={{
											left: `${30 + Math.random() * 40}%`,
											top: `${20 + Math.random() * 40}%`,
										}}
										initial={{ opacity: 0, scale: 0 }}
										animate={{ 
											opacity: [0, 1, 0],
											scale: [0.5, 1.5, 0.5],
										}}
										transition={{ 
											duration: 0.2,
											delay: i * 0.1,
											repeat: 3,
										}}
									>
										<svg width="40" height="60" viewBox="0 0 40 60">
											<path 
												d="M20 0 L25 20 L35 20 L15 40 L20 25 L10 25 Z" 
												fill="#00FFFF"
												filter="drop-shadow(0 0 10px #00FFFF)"
											/>
										</svg>
									</motion.div>
								))}
							</>
						)}

						{/* ROBOT CHARACTER */}
						<AnimatePresence>
							{phase === "robot" && (
								<motion.div
									className="absolute bottom-8 left-1/2"
									initial={{ opacity: 0, scale: 0.5, x: "-50%" }}
									animate={{ 
										opacity: 1, 
										scale: 1,
										x: "-50%",
										y: [-60, -80, -60],
									}}
									transition={{ 
										y: { repeat: Infinity, duration: 0.4 }
									}}
								>
									{/* Robot SVG */}
									<svg width="120" height="200" viewBox="0 0 120 200">
										<defs>
											<linearGradient id="robotMetal" x1="0%" y1="0%" x2="100%" y2="100%">
												<stop offset="0%" stopColor="#667788" />
												<stop offset="50%" stopColor="#99AABB" />
												<stop offset="100%" stopColor="#556677" />
											</linearGradient>
											<filter id="glow">
												<feGaussianBlur stdDeviation="2" result="coloredBlur"/>
												<feMerge>
													<feMergeNode in="coloredBlur"/>
													<feMergeNode in="SourceGraphic"/>
												</feMerge>
											</filter>
										</defs>
										
										{/* Antenna */}
										<line x1="60" y1="5" x2="60" y2="20" stroke="#888" strokeWidth="3" />
										<circle cx="60" cy="5" r="5" fill="#FF0000" filter="url(#glow)">
											<animate attributeName="fill" values="#FF0000;#FF6666;#FF0000" dur="0.5s" repeatCount="indefinite" />
										</circle>
										
										{/* Head */}
										<rect x="30" y="20" width="60" height="50" rx="10" fill="url(#robotMetal)" />
										<rect x="35" y="25" width="50" height="40" rx="5" fill="#1a1a2e" />
										
										{/* Eyes */}
										<circle cx="45" cy="42" r="8" fill="#00FFFF" filter="url(#glow)">
											<animate attributeName="r" values="8;6;8" dur="2s" repeatCount="indefinite" />
										</circle>
										<circle cx="75" cy="42" r="8" fill="#00FFFF" filter="url(#glow)">
											<animate attributeName="r" values="8;6;8" dur="2s" repeatCount="indefinite" />
										</circle>
										
										{/* Mouth display */}
										<rect x="40" y="55" width="40" height="8" rx="2" fill="#00FF00">
											<animate attributeName="width" values="40;30;40;35;40" dur="0.3s" repeatCount="indefinite" />
										</rect>
										
										{/* Neck */}
										<rect x="50" y="70" width="20" height="10" fill="#556677" />
										
										{/* Body */}
										<rect x="25" y="80" width="70" height="60" rx="10" fill="url(#robotMetal)" />
										<rect x="35" y="90" width="50" height="40" rx="5" fill="#1a1a2e" />
										
										{/* Chest display */}
										<circle cx="60" cy="110" r="15" fill="#00FFFF" opacity="0.3" />
										<circle cx="60" cy="110" r="10" fill="#00FFFF" filter="url(#glow)">
											<animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
										</circle>
										
										{/* Arms */}
										<motion.g
											animate={{ rotate: [-30, 30, -30] }}
											transition={{ repeat: Infinity, duration: 0.3 }}
											style={{ transformOrigin: "25px 90px" }}
										>
											<rect x="5" y="85" width="20" height="40" rx="5" fill="url(#robotMetal)" />
											<circle cx="15" cy="130" r="10" fill="#556677" />
										</motion.g>
										<motion.g
											animate={{ rotate: [30, -30, 30] }}
											transition={{ repeat: Infinity, duration: 0.3 }}
											style={{ transformOrigin: "95px 90px" }}
										>
											<rect x="95" y="85" width="20" height="40" rx="5" fill="url(#robotMetal)" />
											<circle cx="105" cy="130" r="10" fill="#556677" />
										</motion.g>
										
										{/* Legs */}
										<motion.g
											animate={{ scaleY: [1, 0.9, 1] }}
											transition={{ repeat: Infinity, duration: 0.4 }}
										>
											<rect x="35" y="140" width="18" height="45" rx="5" fill="url(#robotMetal)" />
											<rect x="67" y="140" width="18" height="45" rx="5" fill="url(#robotMetal)" />
											{/* Feet */}
											<rect x="30" y="180" width="28" height="12" rx="5" fill="#445566" />
											<rect x="62" y="180" width="28" height="12" rx="5" fill="#445566" />
										</motion.g>
									</svg>
								</motion.div>
							)}
						</AnimatePresence>

						{/* BANNER */}
						<AnimatePresence>
							{phase === "robot" && (
								<motion.div
									className="absolute top-0 left-1/2 -translate-x-1/2"
									initial={{ y: -100, opacity: 0, scale: 0.5 }}
									animate={{ y: 0, opacity: 1, scale: 1 }}
									transition={{ type: "spring", bounce: 0.5 }}
								>
									<div 
										className="px-8 py-4 rounded-lg"
										style={{
											background: "linear-gradient(135deg, #000 0%, #1a1a2e 100%)",
											border: "3px solid #00FFFF",
											boxShadow: "0 0 30px #00FFFF, 0 0 60px #00FFFF40, inset 0 0 30px #00FFFF20",
										}}
									>
										<motion.h1 
											className="text-4xl md:text-5xl font-bold text-center"
											style={{
												fontFamily: "'Orbitron', sans-serif",
												color: "#00FFFF",
												textShadow: "0 0 20px #00FFFF, 0 0 40px #00FFFF",
											}}
											animate={{
												textShadow: [
													"0 0 20px #00FFFF, 0 0 40px #00FFFF",
													"0 0 30px #00FFFF, 0 0 60px #00FFFF, 0 0 80px #00FFFF",
													"0 0 20px #00FFFF, 0 0 40px #00FFFF",
												]
											}}
											transition={{ duration: 1.5, repeat: Infinity }}
										>
											ARMCHAIR WORKOUTS
										</motion.h1>
										<motion.p 
											className="text-center mt-2 text-lg"
											style={{ color: "#00FF00" }}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.5 }}
										>
											Transform Your Fitness 🤖💪
										</motion.p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Phase indicator */}
					<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
						{["couch", "getup", "workout", "transform", "robot"].map((p, i) => (
							<motion.div
								key={p}
								className="w-3 h-3 rounded-full"
								style={{
									background: ["couch", "getup", "workout", "transform", "robot"].indexOf(phase) >= i 
										? "#00FFFF" 
										: "#333",
									boxShadow: ["couch", "getup", "workout", "transform", "robot"].indexOf(phase) >= i 
										? "0 0 10px #00FFFF" 
										: "none",
								}}
								animate={{
									scale: phase === p ? [1, 1.3, 1] : 1,
								}}
								transition={{ duration: 0.5, repeat: phase === p ? Infinity : 0 }}
							/>
						))}
					</div>

					{/* Skip button */}
					{skipable && showSkip && (
						<motion.button
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.6 }}
							whileHover={{ opacity: 1 }}
							onClick={onComplete}
							className="absolute top-4 right-4 px-4 py-2 text-gray-400 hover:text-white transition-colors"
						>
							Skip Intro →
						</motion.button>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

