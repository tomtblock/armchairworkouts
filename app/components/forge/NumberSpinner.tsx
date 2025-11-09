"use client";

import { motion } from "framer-motion";

interface NumberSpinnerProps {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (value: number) => void;
	onMinMaxChange?: (min: number, max: number) => void;
	otherValue?: number;
}

export default function NumberSpinner({
	label,
	value,
	min,
	max,
	onChange,
	onMinMaxChange,
	otherValue,
}: NumberSpinnerProps) {
	const handleIncrement = () => {
		if (value < max) {
			const newValue = value + 1;
			onChange(newValue);
			
			// Sync min/max if needed
			if (onMinMaxChange && otherValue !== undefined) {
				if (label.includes("MIN") && newValue > otherValue) {
					onMinMaxChange(newValue, otherValue);
				}
			}
		}
	};

	const handleDecrement = () => {
		if (value > min) {
			const newValue = value - 1;
			onChange(newValue);
			
			// Sync min/max if needed
			if (onMinMaxChange && otherValue !== undefined) {
				if (label.includes("MAX") && newValue < otherValue) {
					onMinMaxChange(otherValue, newValue);
				}
			}
		}
	};

	return (
		<div className="flex flex-col items-center gap-1">
			<label className="text-xs uppercase tracking-wider text-center" style={{
				fontFamily: "'Orbitron', sans-serif",
				color: "#00FFFF",
				textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
			}}>
				{label}
			</label>
			<div className="relative" style={{
				background: "#000000",
				border: "2px solid #00FFFF",
				borderRadius: "4px",
				boxShadow: "inset 0 0 10px rgba(0, 255, 255, 0.1), 0 0 5px rgba(0, 255, 255, 0.3)",
				minWidth: "70px",
				minHeight: "40px",
			}}>
				{/* Value Display - Centered */}
				<div className="absolute inset-0 flex items-center justify-center" style={{
					fontFamily: "'Courier New', monospace",
					color: "#00FFFF",
					fontSize: "1.1rem",
					fontWeight: "bold",
					textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
					paddingRight: "24px", // Make room for arrows
				}}>
					{value}
				</div>
				
				{/* Up/Down Arrows Container */}
				<div className="absolute right-0 top-0 bottom-0 flex flex-col w-6">
					{/* Up Arrow */}
					<motion.button
						onClick={handleIncrement}
						disabled={value >= max}
						className="flex-1 flex items-center justify-center"
						style={{
							borderLeft: "2px solid #00FFFF",
							borderBottom: "1px solid #00FFFF",
							background: value >= max ? "rgba(0, 255, 255, 0.1)" : "rgba(0, 255, 255, 0.2)",
							cursor: value >= max ? "not-allowed" : "pointer",
							opacity: value >= max ? 0.5 : 1,
						}}
						whileHover={value < max ? { background: "rgba(0, 255, 255, 0.3)" } : {}}
						whileTap={value < max ? { scale: 0.95 } : {}}
					>
						<svg width="8" height="5" viewBox="0 0 10 6" fill="none">
							<path d="M5 0L0 5L10 5L5 0Z" fill="#00FFFF" style={{
								filter: "drop-shadow(0 0 3px rgba(0, 255, 255, 0.8))",
							}} />
						</svg>
					</motion.button>
					
					{/* Down Arrow */}
					<motion.button
						onClick={handleDecrement}
						disabled={value <= min}
						className="flex-1 flex items-center justify-center"
						style={{
							borderLeft: "2px solid #00FFFF",
							borderTop: "1px solid #00FFFF",
							background: value <= min ? "rgba(0, 255, 255, 0.1)" : "rgba(0, 255, 255, 0.2)",
							cursor: value <= min ? "not-allowed" : "pointer",
							opacity: value <= min ? 0.5 : 1,
						}}
						whileHover={value > min ? { background: "rgba(0, 255, 255, 0.3)" } : {}}
						whileTap={value > min ? { scale: 0.95 } : {}}
					>
						<svg width="8" height="5" viewBox="0 0 10 6" fill="none">
							<path d="M5 6L0 1L10 1L5 6Z" fill="#00FFFF" style={{
								filter: "drop-shadow(0 0 3px rgba(0, 255, 255, 0.8))",
							}} />
						</svg>
					</motion.button>
				</div>
			</div>
		</div>
	);
}

