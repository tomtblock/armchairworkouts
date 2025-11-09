"use client";

import { motion } from "framer-motion";
import ModeSelector from "./ModeSelector";
import NumberSpinner from "./NumberSpinner";
import ActivateButton from "./ActivateButton";
import type { WorkoutMode } from "@/app/lib/workoutRandomizer";

interface ForgeControlsProps {
	maxSets: number;
	minSets: number;
	maxVolume: number;
	minVolume: number;
	spinCount: number;
	mode: WorkoutMode;
	selectedCategories: string[];
	availableCategories: string[];
	onMaxSetsChange: (value: number) => void;
	onMinSetsChange: (value: number) => void;
	onMaxVolumeChange: (value: number) => void;
	onMinVolumeChange: (value: number) => void;
	onSpinCountChange: (value: number) => void;
	onModeChange: (mode: WorkoutMode) => void;
	onCategoriesChange: (categories: string[]) => void;
	onActivate: () => void;
	isSpinning: boolean;
	loadingWorkouts: boolean;
}

export default function ForgeControls({
	maxSets,
	minSets,
	maxVolume,
	minVolume,
	spinCount,
	mode,
	selectedCategories,
	availableCategories,
	onMaxSetsChange,
	onMinSetsChange,
	onMaxVolumeChange,
	onMinVolumeChange,
	onSpinCountChange,
	onModeChange,
	onCategoriesChange,
	onActivate,
	isSpinning,
	loadingWorkouts,
}: ForgeControlsProps) {
	const handleCategoryToggle = (category: string) => {
		if (selectedCategories.includes(category)) {
			onCategoriesChange(selectedCategories.filter(c => c !== category));
		} else {
			onCategoriesChange([...selectedCategories, category]);
		}
	};

	const handleSelectAll = () => {
		onCategoriesChange([...availableCategories]);
	};

	const handleDeselectAll = () => {
		onCategoriesChange([]);
	};
	return (
		<div className="w-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-4 h-full overflow-y-auto relative" style={{
			border: "2px solid #00FFFF",
			boxShadow: "inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 20px rgba(0, 255, 255, 0.2)",
		}}>
			{/* Title */}
			<div className="border-b border-[#00FFFF] pb-2 mb-3" style={{
				boxShadow: "0 2px 10px rgba(0, 255, 255, 0.3)",
			}}>
				<h2 className="text-3 font-bold uppercase tracking-wider" style={{ 
					fontFamily: "'Orbitron', sans-serif",
					color: "#00FFFF",
					textShadow: "0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)",
				}}>
					CONTROL PANEL
				</h2>
			</div>

			{/* Top Row: 5 Number Spinners */}
			<div className="grid grid-cols-5 gap-3 mb-3">
				<NumberSpinner
					label="MIN SETS"
					value={minSets}
					min={1}
					max={10}
					onChange={(val) => {
						onMinSetsChange(val);
						if (val > maxSets) onMaxSetsChange(val);
					}}
					otherValue={maxSets}
				/>
				<NumberSpinner
					label="MAX SETS"
					value={maxSets}
					min={1}
					max={10}
					onChange={(val) => {
						onMaxSetsChange(val);
						if (val < minSets) onMinSetsChange(val);
					}}
					otherValue={minSets}
				/>
				<NumberSpinner
					label="MIN VOL"
					value={minVolume}
					min={1}
					max={10}
					onChange={(val) => {
						onMinVolumeChange(val);
						if (val > maxVolume) onMaxVolumeChange(val);
					}}
					otherValue={maxVolume}
				/>
				<NumberSpinner
					label="MAX VOL"
					value={maxVolume}
					min={1}
					max={10}
					onChange={(val) => {
						onMaxVolumeChange(val);
						if (val < minVolume) onMinVolumeChange(val);
					}}
					otherValue={minVolume}
				/>
				<NumberSpinner
					label="SPIN COUNT"
					value={spinCount}
					min={1}
					max={4}
					onChange={onSpinCountChange}
				/>
			</div>

			{/* Bottom Row: Difficulty, Exercise Type, and Activate Button */}
			<div className="grid grid-cols-3 gap-3">
				{/* Mode Selector - Compact */}
				<div className="space-y-2">
					<label className="text-xs uppercase tracking-wider block" style={{
						fontFamily: "'Orbitron', sans-serif",
						color: "#00FFFF",
						textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
					}}>
						DIFFICULTY
					</label>
					<div className="flex flex-col gap-1">
						{[
							{ value: "easy" as WorkoutMode, label: "EASY MODE" },
							{ value: "standard" as WorkoutMode, label: "STANDARD MODE" },
							{ value: "beast" as WorkoutMode, label: "BEAST MODE" },
						].map((m) => (
							<button
								key={m.value}
								onClick={() => onModeChange(m.value)}
								className={`px-2 py-1 border rounded text-xs font-bold uppercase transition-all text-left ${
									mode === m.value
										? "border-[#00FFFF]"
										: "border-[#333] hover:border-[#00FFFF]"
								}`}
								style={mode === m.value ? {
									fontFamily: "'Orbitron', sans-serif",
									background: "rgba(0, 255, 255, 0.1)",
									color: "#00FFFF",
									boxShadow: "0 0 10px rgba(0, 255, 255, 0.5), inset 0 0 5px rgba(0, 255, 255, 0.1)",
									textShadow: "0 0 5px rgba(0, 255, 255, 0.8)",
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

				{/* Category/Type Selector - Compact with all types */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label className="text-xs uppercase tracking-wider block" style={{
							fontFamily: "'Orbitron', sans-serif",
							color: "#00FFFF",
							textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
						}}>
							EXERCISE TYPE
						</label>
						<div className="flex gap-1">
							<button
								onClick={handleSelectAll}
								className="text-[10px] uppercase transition-colors px-1"
								style={{ color: "#00FFFF", fontFamily: "'Courier New', monospace" }}
								onMouseEnter={(e) => e.currentTarget.style.textShadow = "0 0 5px rgba(0, 255, 255, 0.8)"}
								onMouseLeave={(e) => e.currentTarget.style.textShadow = "none"}
							>
								ALL
							</button>
							<span style={{ color: "#00FFFF" }}>|</span>
							<button
								onClick={handleDeselectAll}
								className="text-[10px] uppercase transition-colors px-1"
								style={{ color: "#00FFFF", fontFamily: "'Courier New', monospace" }}
								onMouseEnter={(e) => e.currentTarget.style.textShadow = "0 0 5px rgba(0, 255, 255, 0.8)"}
								onMouseLeave={(e) => e.currentTarget.style.textShadow = "none"}
							>
								NONE
							</button>
						</div>
					</div>
					<div className="space-y-0.5 max-h-40 overflow-y-auto">
						{availableCategories.map((category) => (
							<label
								key={category}
								className="flex items-center gap-1 cursor-pointer p-0.5 rounded transition-colors"
								style={{
									background: selectedCategories.includes(category) ? "rgba(0, 255, 255, 0.05)" : "transparent",
								}}
								onMouseEnter={(e) => {
									if (!selectedCategories.includes(category)) {
										e.currentTarget.style.background = "rgba(0, 255, 255, 0.02)";
									}
								}}
								onMouseLeave={(e) => {
									if (!selectedCategories.includes(category)) {
										e.currentTarget.style.background = "transparent";
									}
								}}
							>
								<input
									type="checkbox"
									checked={selectedCategories.includes(category)}
									onChange={() => handleCategoryToggle(category)}
									className="w-3 h-3 rounded"
									style={{
										border: "1.5px solid #00FFFF",
										background: selectedCategories.includes(category) ? "#00FFFF" : "transparent",
										boxShadow: selectedCategories.includes(category) ? "0 0 5px rgba(0, 255, 255, 0.5)" : "none",
									}}
								/>
								<span className="text-[10px] flex-1" style={{ 
									color: selectedCategories.includes(category) ? "#00FFFF" : "#999",
									fontFamily: "'Courier New', monospace",
									textShadow: selectedCategories.includes(category) ? "0 0 3px rgba(0, 255, 255, 0.5)" : "none",
								}}>{category}</span>
							</label>
						))}
					</div>
					{selectedCategories.length === 0 && (
						<p className="text-[10px] italic" style={{ color: "#666", fontFamily: "'Courier New', monospace" }}>Select at least one</p>
					)}
				</div>

				{/* Activate Button */}
				<div className="flex flex-col items-center justify-center">
					<ActivateButton 
						onActivate={onActivate} 
						disabled={isSpinning || loadingWorkouts || selectedCategories.length === 0}
					/>
				</div>
			</div>
		</div>
	);
}

