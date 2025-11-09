"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@whop/react/components";
import HeaderStatusBar from "./HeaderStatusBar";
import ForgeReel from "./ForgeReel";
import ForgeControls from "./ForgeControls";
import MultiSpinDisplay from "./MultiSpinDisplay";
import SubscriptionStatusBar from "./SubscriptionStatus";
import UpgradeModal from "./UpgradeModal";
import { WorkoutRandomizer, type WorkoutResult, type WorkoutMode } from "@/app/lib/workoutRandomizer";
import type { SubscriptionStatus } from "@/app/api/subscription/route";

export default function WorkoutForgeApp() {
	const [isSpinning, setIsSpinning] = useState(false);
	const [results, setResults] = useState<WorkoutResult[]>([]);
	const [spinHistory, setSpinHistory] = useState<WorkoutResult[]>([]);
	const [showForgeAgain, setShowForgeAgain] = useState(false);
	const [loadingWorkouts, setLoadingWorkouts] = useState(true);
	const [loadingHistory, setLoadingHistory] = useState(true);
	const [loadingSubscription, setLoadingSubscription] = useState(true);
	const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const [randomizer, setRandomizer] = useState<WorkoutRandomizer | null>(null);
	const [totalSpinCount, setTotalSpinCount] = useState(0);
	
	// Control states
	const [minSets, setMinSets] = useState(1);
	const [maxSets, setMaxSets] = useState(5);
	const [minVolume, setMinVolume] = useState(1);
	const [maxVolume, setMaxVolume] = useState(5);
	const [spinCount, setSpinCount] = useState(1); // Number of simultaneous spins
	const [mode, setMode] = useState<WorkoutMode>("standard");
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [availableCategories, setAvailableCategories] = useState<string[]>([]);

	// Load subscription status and history on mount
	useEffect(() => {
		loadSubscription();
		loadHistory();
	}, []);

	const loadSubscription = async () => {
		try {
			const response = await fetch("/api/subscription");
			if (response.ok) {
				const data = await response.json();
				setSubscription(data);
			} else {
				// If subscription API fails, create a default free tier subscription
				console.warn("Subscription API failed, using default free tier");
				setSubscription({
					tier: "free",
					hasUnlimitedGenerations: false,
					hasStorage: false,
					hasAnalytics: false,
					freeSpinsRemaining: 2,
					products: [],
				});
			}
		} catch (error) {
			console.error("Failed to load subscription:", error);
			// Fallback to free tier if subscription check fails
			setSubscription({
				tier: "free",
				hasUnlimitedGenerations: false,
				hasStorage: false,
				hasAnalytics: false,
				freeSpinsRemaining: 2,
				products: [],
			});
		} finally {
			setLoadingSubscription(false);
		}
	};

	const loadHistory = async () => {
		try {
			const response = await fetch("/api/workout-history");
			if (response.ok) {
				const data = await response.json();
				if (data.history && Array.isArray(data.history)) {
					setSpinHistory(data.history);
					// Optionally sync spinCount with history length
					if (data.history.length > 0 && spinCount === 1) {
						setSpinCount(Math.min(data.history.length, 5));
					}
				}
			} else {
				// Log error details for debugging
				const errorData = await response.json().catch(() => ({}));
				console.warn("Failed to load history from Supabase:", {
					status: response.status,
					details: errorData.details || errorData.error || "Unknown error",
				});
				// Fallback to localStorage if API fails
				if (typeof window !== "undefined") {
					const saved = localStorage.getItem("workout-forge-history");
					if (saved) {
						try {
							const parsed = JSON.parse(saved);
							setSpinHistory(parsed);
						} catch (e) {
							console.error("Failed to load history from localStorage:", e);
						}
					}
				}
			}
		} catch (error) {
			console.error("Failed to load history:", error);
			// Fallback to localStorage
			if (typeof window !== "undefined") {
				const saved = localStorage.getItem("workout-forge-history");
				if (saved) {
					try {
						const parsed = JSON.parse(saved);
						setSpinHistory(parsed);
					} catch (e) {
						console.error("Failed to load history from localStorage:", e);
					}
				}
			}
		} finally {
			setLoadingHistory(false);
		}
	};

	const saveHistory = async (newWorkouts: WorkoutResult[]) => {
		try {
			const response = await fetch("/api/workout-history", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ workouts: newWorkouts }),
			});

			if (!response.ok) {
				// Try to get error details from response
				let errorDetails = "Unknown error";
				const contentType = response.headers.get("content-type");
				
				if (contentType && contentType.includes("application/json")) {
					try {
						const errorData = await response.json();
						errorDetails = errorData.details || errorData.error || `HTTP ${response.status}`;
					} catch (e) {
						errorDetails = `HTTP ${response.status}: ${response.statusText}`;
					}
				} else {
					try {
						const text = await response.text();
						errorDetails = text || `HTTP ${response.status}: ${response.statusText}`;
					} catch (e) {
						errorDetails = `HTTP ${response.status}: ${response.statusText}`;
					}
				}

				console.warn("Failed to save history to Supabase:", {
					status: response.status,
					statusText: response.statusText,
					details: errorDetails,
					note: "Using localStorage as fallback. Create the 'workout_history' table in Supabase to enable cloud storage.",
				});
				
				// Fallback to localStorage only (state already updated in triggerSpin)
				if (typeof window !== "undefined") {
					setSpinHistory((currentHistory) => {
						localStorage.setItem("workout-forge-history", JSON.stringify(currentHistory));
						return currentHistory;
					});
				}
			}
		} catch (error) {
			console.warn("Error saving history:", error);
			// Fallback to localStorage only (state already updated in triggerSpin)
			if (typeof window !== "undefined") {
				setSpinHistory((currentHistory) => {
					localStorage.setItem("workout-forge-history", JSON.stringify(currentHistory));
					return currentHistory;
				});
			}
		}
	};

	// Load workouts on mount
	useEffect(() => {
		loadWorkouts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadWorkouts = async () => {
		try {
			const response = await fetch("/api/workouts");
			if (response.ok) {
				const data = await response.json();
				const newRandomizer = new WorkoutRandomizer(data.workouts, minSets, maxSets, minVolume, maxVolume);
				setRandomizer(newRandomizer);
				
				// Get available categories
				const categories = newRandomizer.getAvailableCategories();
				setAvailableCategories(categories);
				
				// Select all categories by default
				if (selectedCategories.length === 0) {
					setSelectedCategories(categories);
				}
			} else {
				// Fallback to default workouts
				const newRandomizer = new WorkoutRandomizer(undefined, minSets, maxSets, minVolume, maxVolume);
				setRandomizer(newRandomizer);
				const categories = newRandomizer.getAvailableCategories();
				setAvailableCategories(categories);
				if (selectedCategories.length === 0) {
					setSelectedCategories(categories);
				}
			}
		} catch (error) {
			console.error("Failed to load workouts:", error);
			// Fallback to default workouts
			const newRandomizer = new WorkoutRandomizer(undefined, minSets, maxSets, minVolume, maxVolume);
			setRandomizer(newRandomizer);
			const categories = newRandomizer.getAvailableCategories();
			setAvailableCategories(categories);
			if (selectedCategories.length === 0) {
				setSelectedCategories(categories);
			}
		} finally {
			setLoadingWorkouts(false);
		}
	};

	// Update randomizer config when minSets, maxSets, minVolume, maxVolume, mode, or selectedCategories change
	useEffect(() => {
		if (randomizer) {
			randomizer.updateConfig(minSets, maxSets, minVolume, maxVolume, mode, selectedCategories);
		}
	}, [minSets, maxSets, minVolume, maxVolume, mode, selectedCategories, randomizer]);

	const triggerSpin = async () => {
		if (isSpinning || !randomizer || selectedCategories.length === 0) return;

		// Load subscription if not loaded yet, but don't block the spin
		let currentSubscription = subscription;
		if (!currentSubscription) {
			await loadSubscription();
			// Use a default free subscription if still null after loading
			currentSubscription = subscription || {
				tier: "free" as const,
				hasUnlimitedGenerations: false,
				hasStorage: false,
				hasAnalytics: false,
				freeSpinsRemaining: 2,
				products: [],
			};
		}

		// Check if user has spins remaining
		if (!currentSubscription.hasUnlimitedGenerations && currentSubscription.freeSpinsRemaining < spinCount) {
			setShowUpgradeModal(true);
			return;
		}

		// Reset state
		setIsSpinning(true);
		setResults([]);
		setShowForgeAgain(false);

		// Decrement free spins if not unlimited
		if (!currentSubscription.hasUnlimitedGenerations && currentSubscription.freeSpinsRemaining >= spinCount) {
			try {
				await fetch("/api/subscription", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ spinsUsed: spinCount }),
				});
				// Reload subscription status (don't await to avoid blocking)
				loadSubscription();
			} catch (error) {
				console.error("Failed to update free spins:", error);
				// Update local state even if API fails
				if (currentSubscription) {
					setSubscription({
						...currentSubscription,
						freeSpinsRemaining: Math.max(0, currentSubscription.freeSpinsRemaining - spinCount),
					});
				}
			}
		}

		// Generate multiple workouts after 2 seconds (as requested)
		// Capture currentSubscription in closure
		const subscriptionForSave = currentSubscription;
		setTimeout(() => {
			const newResults = randomizer.generateMultiple(spinCount, minSets, maxSets, minVolume, maxVolume);
			setResults(newResults);
			setTotalSpinCount((prev) => prev + spinCount);

			// Update history (keep last 20)
			setSpinHistory((prev) => {
				const updated = [...newResults, ...prev].slice(0, 20);
				return updated;
			});

			// Save to Supabase only if user has storage (premium)
			if (subscriptionForSave?.hasStorage) {
				saveHistory(newResults);
			}

			// Stop spinning and show "Forge Again" button
			setIsSpinning(false);
			setTimeout(() => {
				setShowForgeAgain(true);
			}, 400);
		}, 2000); // 2 seconds as requested
	};

	const handleForgeAgain = () => {
		triggerSpin();
	};

	return (
		<div className="min-h-screen flex flex-col relative overflow-hidden" style={{
			background: "#000000",
		}}>
			{/* Header Status Bar */}
			<div className="w-full pt-4 z-10 relative">
				<HeaderStatusBar status="online" ready={!loadingWorkouts} />
			</div>

			{/* Subscription Status Bar */}
			{subscription && !loadingSubscription && (
				<div className="px-4 z-10 relative">
					<div className="flex items-center gap-2 mb-2">
						<SubscriptionStatusBar 
							subscription={subscription} 
							onUpgrade={() => setShowUpgradeModal(true)}
						/>
						{subscription.hasAnalytics && (
							<a
								href="/dashboard/history"
								className="px-4 py-2 border-2 border-[#00FFFF] rounded font-mono text-sm font-bold uppercase transition-all hover:bg-[#00FFFF]/10"
								style={{
									color: "#00FFFF",
									boxShadow: "0 0 10px rgba(0, 255, 255, 0.3)",
									textShadow: "0 0 5px rgba(0, 255, 255, 0.8)",
								}}
							>
								VIEW HISTORY
							</a>
						)}
					</div>
				</div>
			)}

			{/* Upgrade Modal */}
			<UpgradeModal
				isOpen={showUpgradeModal}
				onClose={() => setShowUpgradeModal(false)}
				currentTier={subscription?.tier || "free"}
			/>

			{/* Top Section - Control Panel + Lever (Wireframe Layout) */}
			<div className="flex gap-4 px-4 pb-4 z-10 relative" style={{ minHeight: "300px" }}>
				{/* Control Panel - Full width with ACTIVATE button inside */}
				<div className="flex-1 rounded-lg overflow-hidden" style={{
					border: "2px solid #00FFFF",
					boxShadow: "inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 20px rgba(0, 255, 255, 0.2)",
				}}>
					<ForgeControls
						maxSets={maxSets}
						minSets={minSets}
						maxVolume={maxVolume}
						minVolume={minVolume}
						spinCount={spinCount}
						mode={mode}
						selectedCategories={selectedCategories}
						availableCategories={availableCategories}
						onMaxSetsChange={setMaxSets}
						onMinSetsChange={setMinSets}
						onMaxVolumeChange={setMaxVolume}
						onMinVolumeChange={setMinVolume}
						onSpinCountChange={setSpinCount}
						onModeChange={setMode}
						onCategoriesChange={setSelectedCategories}
						onActivate={triggerSpin}
						isSpinning={isSpinning}
						loadingWorkouts={loadingWorkouts}
					/>
				</div>
			</div>

			{/* Bottom Section - Terminal Display for Workouts */}
			<div className="flex-1 px-4 pb-4 z-10 relative">
				<div className="terminal-window scanline rounded-lg p-6 md:p-8 h-full min-h-[400px]">
					{/* Terminal Corner Brackets */}
					<div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />

					{/* Terminal Prompt */}
					<div className="mb-4">
						<p className="text-2" style={{
							fontFamily: "'Courier New', monospace",
							color: "#00FF00",
							textShadow: "0 0 10px rgba(0, 255, 0, 0.8)",
						}}>
							&gt; WORKOUT_FORGE v2.0 READY
						</p>
						{totalSpinCount > 0 && (
							<p className="text-1 mt-1" style={{
								fontFamily: "'Courier New', monospace",
								color: "#00FFFF",
								textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
							}}>
								&gt; FORGED: {totalSpinCount} {totalSpinCount === 1 ? "TIME" : "TIMES"}
							</p>
						)}
					</div>

					{/* Workout Display Area */}
					<div className="flex flex-col items-center justify-center min-h-[300px]">
						{spinCount === 1 ? (
							<div className="flex flex-wrap justify-center gap-4 md:gap-6">
								<ForgeReel
									type="sets"
									value={results[0]?.sets ?? null}
									isSpinning={isSpinning}
									delay={0}
								/>
								<ForgeReel
									type="workout"
									value={results[0]?.workout ?? null}
									isSpinning={isSpinning}
									delay={0.1}
									description={results[0]?.description}
								/>
								<ForgeReel
									type="amount"
									value={results[0]?.amount ?? null}
									isSpinning={isSpinning}
									delay={0.2}
								/>
								<ForgeReel
									type="repsTime"
									value={results[0]?.repsTime ?? null}
									isSpinning={isSpinning}
									delay={0.3}
								/>
								<ForgeReel
									type="type"
									value={results[0]?.type ?? null}
									isSpinning={isSpinning}
									delay={0.4}
								/>
							</div>
						) : (
							<MultiSpinDisplay
								results={results}
								isSpinning={isSpinning}
								spinCount={spinCount}
							/>
						)}

						{/* Forge Again Button */}
						{showForgeAgain && (
							<motion.div
								className="mt-8"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3 }}
							>
								<Button
									variant="classic"
									size="4"
									onClick={handleForgeAgain}
									className="uppercase tracking-wider font-mono"
									style={{
										fontFamily: "'Orbitron', sans-serif",
										border: "2px solid #00FFFF",
										boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
									}}
								>
									FORGE AGAIN
								</Button>
							</motion.div>
						)}
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full py-4 px-4 border-t" style={{
				borderColor: "#00FFFF",
				boxShadow: "0 -2px 10px rgba(0, 255, 255, 0.3)",
			}}>
				<div className="max-w-4xl mx-auto text-center">
					<p className="text-1 uppercase tracking-wider" style={{
						fontFamily: "'Courier New', monospace",
						color: "#00FFFF",
						textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
					}}>
						WORKOUT FORGE // TBLOCK SYSTEM
					</p>
				</div>
			</footer>
		</div>
	);
}

