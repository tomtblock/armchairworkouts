"use client";

import { motion } from "framer-motion";
import type { WorkoutMode } from "@/app/lib/workoutRandomizer";

interface ModeSelectorProps {
	mode: WorkoutMode;
	onModeChange: (mode: WorkoutMode) => void;
}

const modes: { value: WorkoutMode; label: string }[] = [
	{ value: "easy", label: "EASY MODE" },
	{ value: "standard", label: "STANDARD MODE" },
	{ value: "beast", label: "BEAST MODE" },
];

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
	return (
		<div className="space-y-3">
			<label className="text-2 uppercase tracking-wider block" style={{
				fontFamily: "'Orbitron', sans-serif",
				color: "#00FFFF",
				textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
			}}>
				DIFFICULTY MODE
			</label>
			<div className="flex flex-col gap-2">
				{modes.map((m) => (
					<button
						key={m.value}
						onClick={() => onModeChange(m.value)}
						className={`px-4 py-3 border-2 rounded-lg font-mono text-2 font-bold uppercase transition-all text-left ${
							mode === m.value
								? "border-[#00FFFF]"
								: "border-[#333] hover:border-[#00FFFF]"
						}`}
						style={mode === m.value ? {
							fontFamily: "'Orbitron', sans-serif",
							background: "rgba(0, 255, 255, 0.1)",
							color: "#00FFFF",
							boxShadow: "0 0 15px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.1)",
							textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
						} : {
							fontFamily: "'Orbitron', sans-serif",
							background: "#1a1a1a",
							color: "#666",
						}}
					>
						{m.label}
					</button>
				))}
			</div>
		</div>
	);
}

