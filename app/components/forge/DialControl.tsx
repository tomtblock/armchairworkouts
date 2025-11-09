"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface DialControlProps {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (value: number) => void;
	onMinMaxChange?: (min: number, max: number) => void;
	otherValue?: number; // For syncing min/max
}

export default function DialControl({
	label,
	value,
	min,
	max,
	onChange,
	onMinMaxChange,
	otherValue,
}: DialControlProps) {
	const [isDragging, setIsDragging] = useState(false);
	const dialRef = useRef<HTMLDivElement>(null);
	const startAngleRef = useRef(0);
	const startValueRef = useRef(0);

	// Calculate angle based on value (0-360 degrees, where 0 = min, 180 = middle, 360 = max)
	const angle = ((value - min) / (max - min)) * 270 - 135; // -135 to 135 degrees range

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
		if (dialRef.current) {
			const rect = dialRef.current.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
			startAngleRef.current = startAngle;
			startValueRef.current = value;
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!dialRef.current) return;

			const rect = dialRef.current.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
			
			// Calculate angle difference
			let angleDiff = currentAngle - startAngleRef.current;
			
			// Normalize angle difference to -180 to 180
			if (angleDiff > 180) angleDiff -= 360;
			if (angleDiff < -180) angleDiff += 360;
			
			// Convert angle change to value change
			const angleRange = 270; // Total range in degrees
			const valueRange = max - min;
			const valueChange = (angleDiff / angleRange) * valueRange;
			
			let newValue = Math.round(startValueRef.current + valueChange);
			newValue = Math.max(min, Math.min(max, newValue));
			
			onChange(newValue);
			
			// Sync min/max if needed
			if (onMinMaxChange && otherValue !== undefined) {
				if (label.includes("MIN") && newValue > otherValue) {
					onMinMaxChange(newValue, otherValue);
				} else if (label.includes("MAX") && newValue < otherValue) {
					onMinMaxChange(otherValue, newValue);
				}
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, min, max, onChange, onMinMaxChange, otherValue, label]);

	return (
		<div className="flex flex-col items-center gap-2">
			<label className="text-1 uppercase tracking-wider text-center" style={{
				fontFamily: "'Orbitron', sans-serif",
				color: "#00FFFF",
				textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
			}}>
				{label}
			</label>
			<div
				ref={dialRef}
				className="relative w-20 h-20 cursor-grab active:cursor-grabbing"
				onMouseDown={handleMouseDown}
			>
				{/* Dial Background Circle */}
				<div className="absolute inset-0 rounded-full" style={{
					background: "radial-gradient(circle, #1a1a1a 0%, #000000 100%)",
					border: "2px solid #00FFFF",
					boxShadow: "inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 10px rgba(0, 255, 255, 0.3)",
				}}>
					{/* Dial Markings */}
					{Array.from({ length: 10 }).map((_, i) => {
						const markAngle = (i * 270 / 9) - 135;
						const rad = (markAngle * Math.PI) / 180;
						const x = 50 + 35 * Math.cos(rad);
						const y = 50 + 35 * Math.sin(rad);
						return (
							<div
								key={i}
								className="absolute w-1 h-1 rounded-full"
								style={{
									left: `${x}%`,
									top: `${y}%`,
									background: "#00FFFF",
									boxShadow: "0 0 3px rgba(0, 255, 255, 0.8)",
									transform: "translate(-50%, -50%)",
								}}
							/>
						);
					})}
				</div>

				{/* Dial Needle/Indicator */}
				<motion.div
					className="absolute top-1/2 left-1/2 origin-bottom"
					style={{
						width: "3px",
						height: "35px",
						background: "linear-gradient(to top, #00FFFF 0%, transparent 100%)",
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
						transform: `translate(-50%, -50%) rotate(${angle}deg)`,
						transformOrigin: "bottom center",
					}}
					animate={{ rotate: angle }}
					transition={{ type: "spring", stiffness: 200, damping: 20 }}
				/>

				{/* Center Dot */}
				<div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2" style={{
					background: "#00FFFF",
					boxShadow: "0 0 10px rgba(0, 255, 255, 0.8), inset 0 0 5px rgba(255,255,255,0.3)",
				}} />

				{/* Value Display */}
				<div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
					<div className="text-3 font-bold" style={{
						fontFamily: "'Courier New', monospace",
						color: "#00FFFF",
						textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
					}}>
						{value}
					</div>
				</div>
			</div>
		</div>
	);
}

