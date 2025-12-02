"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderStatusBar from "./HeaderStatusBar";
import ForgeReel from "./ForgeReel";
import ForgeControls from "./ForgeControls";
import MultiSpinDisplay from "./MultiSpinDisplay";
import SubscriptionStatusBar from "./SubscriptionStatus";
import UpgradeModal from "./UpgradeModal";
import PackOpeningAnimation from "./PackOpeningAnimation";
import LandingAnimation from "./LandingAnimation";
import ExerciseCompletionExplosion from "./ExerciseCompletionExplosion";
import { WorkoutRandomizer, type WorkoutResult, type WorkoutMode } from "@/app/lib/workoutRandomizer";
import type { SubscriptionStatus } from "@/app/api/subscription/route";
import { shouldShowAlerts } from "@/lib/whop-utils";

export default function WorkoutForgeApp() {
	const [isSpinning, setIsSpinning] = useState(false);
	const [results, setResults] = useState<WorkoutResult[]>([]);
	const [spinHistory, setSpinHistory] = useState<WorkoutResult[]>([]);
	const [savedWorkouts, setSavedWorkouts] = useState<Set<number>>(new Set());
	const [completedWorkouts, setCompletedWorkouts] = useState<Set<number>>(new Set());
	const [explosionPos, setExplosionPos] = useState<{ x: number; y: number } | null>(null);
	const [showExplosion, setShowExplosion] = useState(false);
	const [loadingWorkouts, setLoadingWorkouts] = useState(true);
	const [loadingHistory, setLoadingHistory] = useState(true);
	const [loadingSubscription, setLoadingSubscription] = useState(true);
	const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const [randomizer, setRandomizer] = useState<WorkoutRandomizer | null>(null);
	const [totalSpinCount, setTotalSpinCount] = useState(0);
	const [isDemo, setIsDemo] = useState(false);
	const [isTestMode, setIsTestMode] = useState(false);
	const [testModeTier, setTestModeTier] = useState("premium");
	const [showPackOpening, setShowPackOpening] = useState(false);
	const [pendingResults, setPendingResults] = useState<WorkoutResult[]>([]);
	const [showLandingAnimation, setShowLandingAnimation] = useState(false);
	const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
	const [upgradePromptType, setUpgradePromptType] = useState<"save" | "complete">("save");
	
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
	// IMPORTANT: Check for testmode param FIRST before loading subscription
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const testModeParam = urlParams.get("testmode");
		
		if (testModeParam) {
			console.log(`🧪 Test mode URL param detected: ${testModeParam}`);
			// Load subscription with the testmode param to set/clear cookie
			fetch(`/api/subscription?testmode=${testModeParam}`)
				.then(res => res.json())
				.then(data => {
					setSubscription(data);
					setIsDemo(data.demo);
					setIsTestMode(data.testMode || false);
					setTestModeTier(data.tier || "premium");
					console.log("🧪 Test mode subscription loaded:", data);
					// Remove the URL param to prevent repeated requests
					const newUrl = window.location.pathname;
					window.history.replaceState({}, "", newUrl);
				})
				.catch(err => {
					console.error("Failed to load test mode:", err);
					// Fallback to regular load
					loadSubscription();
				});
		} else {
			// No testmode param, load normally
			loadSubscription();
		}
		
		// Always load history
		loadHistory();
	}, []);

	// Check if landing animation should show (client-side only)
	useEffect(() => {
		// Check URL param for forcing animation: ?intro=1
		const urlParams = new URLSearchParams(window.location.search);
		const forceIntro = urlParams.get("intro") === "1";
		
		const hasSeenIntro = localStorage.getItem("armchair-workouts-intro-seen");
		console.log("🎬 Landing animation check:", { hasSeenIntro, forceIntro });
		
		if (forceIntro || !hasSeenIntro) {
			setShowLandingAnimation(true);
			console.log("🎬 Showing landing animation!");
		} else {
			console.log("🎬 Skipping landing animation (already seen)");
		}
	}, []);

	// Refresh subscription when window regains focus (after returning from checkout)
	useEffect(() => {
		const handleFocus = () => {
			// Check if we have a pending upgrade
			const pendingUpgrade = sessionStorage.getItem("pendingUpgrade");
			if (pendingUpgrade) {
				sessionStorage.removeItem("pendingUpgrade");
				// Refresh subscription after a short delay to allow Whop to process
				setTimeout(() => {
					loadSubscription();
				}, 1000);
			} else {
				loadSubscription();
			}
		};
		window.addEventListener("focus", handleFocus);
		// Also check on load in case user navigated back
		if (typeof window !== "undefined" && sessionStorage.getItem("pendingUpgrade")) {
			setTimeout(() => {
				loadSubscription();
				sessionStorage.removeItem("pendingUpgrade");
			}, 1000);
		}
		return () => window.removeEventListener("focus", handleFocus);
	}, []);

	const loadSubscription = async () => {
		try {
			const response = await fetch("/api/subscription");
			if (response.ok) {
				const data = await response.json();
				setSubscription(data);
				// Check if API returned demo mode flag
				if (data.demo) {
					setIsDemo(true);
					console.log("📍 Running in demo mode - Whop authentication not detected");
				} else {
					setIsDemo(false);
				}
				// Check for test mode
				if (data.testMode) {
					setIsTestMode(true);
					setTestModeTier(data.tier || "premium");
					console.log(`🧪 Test mode active: ${data.tier} tier`);
				} else {
					setIsTestMode(false);
				}
			} else {
				// If subscription API fails, create a default free tier subscription
				console.warn("Subscription API failed, using default free tier");
				setIsDemo(true);
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
			setIsDemo(true);
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

	// Save individual workout
	const handleSaveWorkout = async (workout: WorkoutResult, index: number) => {
		// Check if user has storage (Premium only) or is in test mode with premium
		const canSave = subscription?.hasStorage || (isTestMode && testModeTier === "premium");
		
		if (!canSave) {
			// Different message based on tier
			// Show styled upgrade prompt instead of browser confirm
			setUpgradePromptType("save");
			setShowUpgradePrompt(true);
			return;
		}

		// Validate workout data before sending
		if (!workout || !workout.workout || !workout.sets || !workout.amount || !workout.repsTime || !workout.type) {
			console.error("Invalid workout data:", workout);
			alert("⚠️ Invalid workout data. Please try generating a new workout.");
			return;
		}

		console.log("Saving workout:", { 
			workout: workout.workout, 
			sets: workout.sets, 
			amount: workout.amount, 
			repsTime: workout.repsTime, 
			type: workout.type,
			description: workout.description 
		});

		try {
			// Add saved: true flag to indicate this is a "saved to collection" workout
			const workoutToSave = {
				...workout,
				saved: true, // This goes to Saved Collection
			};
			
			const response = await fetch("/api/workout-history", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ workouts: [workoutToSave] }),
			});

			// Safely parse response - read body once
			let responseData: any = {};
			try {
				const text = await response.text();
				if (text) {
					try {
						responseData = JSON.parse(text);
					} catch (parseError) {
						// Not JSON, use as plain text
						responseData = { 
							error: `Server returned ${response.status} ${response.statusText}`,
							message: text,
							status: response.status,
							statusText: response.statusText
						};
					}
				} else {
					// Empty response
					responseData = { 
						error: `Server returned ${response.status} ${response.statusText}`,
						message: "Empty response from server",
						status: response.status,
						statusText: response.statusText
					};
				}
			} catch (readError) {
				console.error("Failed to read response body:", readError);
				responseData = { 
					error: "Failed to read response",
					message: readError instanceof Error ? readError.message : String(readError),
					status: response.status,
					statusText: response.statusText
				};
			}

			if (response.ok) {
				// Check if it's a demo/test mode response
				if (responseData.demo || responseData.testMode) {
					console.log(responseData.testMode ? "🧪 Test mode - workout saved:" : "📍 Demo mode - workout save simulated:", responseData.message);
					
					// Save to localStorage in test mode - mark as "saved" collection item
					if (responseData.testMode && typeof window !== "undefined") {
						try {
							const existing = JSON.parse(localStorage.getItem("armchair-workout-history") || "[]");
							existing.unshift({
								...workout,
								id: `saved-${Date.now()}`,
								createdAt: new Date().toISOString(),
								saved: true, // This goes to the Saved Collection
							});
							localStorage.setItem("armchair-workout-history", JSON.stringify(existing.slice(0, 100)));
							console.log("✅ Workout saved to collection in localStorage!");
						} catch (e) {
							console.error("Failed to save to localStorage:", e);
						}
					}
					
					// Still mark as "saved" locally for UX
					setSavedWorkouts((prev) => new Set(prev).add(index));
					setSpinHistory((prev) => [workout, ...prev].slice(0, 20));
					
					// Show success indicator
					if (typeof window !== "undefined") {
						const button = document.querySelector(`[data-workout-index="${index}"]`);
						if (button) {
							button.classList.add(responseData.testMode ? "saved-success" : "saved-demo");
						}
					}
					return;
				}
				
				// Mark as saved
				setSavedWorkouts((prev) => new Set(prev).add(index));
				// Update local history
				setSpinHistory((prev) => [workout, ...prev].slice(0, 20));
				console.log("✅ Workout saved successfully:", responseData);
				
				// Show success feedback
				if (typeof window !== "undefined") {
					// Optional: Show a brief success message
					const button = document.querySelector(`[data-workout-index="${index}"]`);
					if (button) {
						button.classList.add("saved-success");
					}
				}
			} else {
				// Log detailed error information
				const errorInfo = {
					status: response.status,
					statusText: response.statusText,
					url: response.url,
					data: responseData,
					hasError: !!responseData.error,
					hasMessage: !!responseData.message,
					errorKeys: Object.keys(responseData || {})
				};
				console.error("❌ Failed to save workout:", errorInfo);
				
				const showAlert = shouldShowAlerts();
				const logMessage = (msg: string) => {
					if (showAlert) {
						alert(msg);
					} else {
						console.warn("⚠️ [Demo Mode] " + msg.replace(/\n/g, " "));
					}
				};
				
				// Show error message based on error type
				if (responseData.requiresUpgrade) {
					logMessage(`⚠️ ${responseData.message || "Upgrade to Premium to save workouts"}`);
				} else if (responseData.requiresConfig) {
					// API key configuration error - show detailed message
					const configMessage = 
						`⚠️ API Configuration Error\n\n` +
						`${responseData.message || "Invalid Whop API key configuration"}\n\n` +
						`${responseData.hint || "Please check your environment variables."}\n\n` +
						`Make sure:\n` +
						`1. WHOP_API_KEY is set in .env.development\n` +
						`2. NEXT_PUBLIC_WHOP_APP_ID is set in .env.development\n` +
						`3. Restart your dev server after updating .env.development\n\n` +
						(responseData.details ? `Error details: ${responseData.details}` : "");
					logMessage(configMessage);
					console.error("Full API config error:", responseData);
				} else if (responseData.requiresWhopConnection) {
					// When not in Whop, just log - this is expected in demo mode
					if (showAlert) {
						alert(
							`⚠️ Authentication Required\n\n` +
							`${responseData.message || "Please access this app through Whop."}\n\n` +
							`See WHOP_LOCALHOST_SETUP.md for instructions.`
						);
					} else {
						console.warn("⚠️ [Demo Mode] Saving workouts requires Whop authentication. App is running in demo mode.");
					}
				} else if (responseData.error) {
					// Check if error message contains "API key" or similar
					const errorMsg = responseData.message || responseData.error || "Failed to save workout. Please try again.";
					const errorLower = errorMsg.toLowerCase();
					
					if (errorLower.includes("api key") || errorLower.includes("invalid") && errorLower.includes("key")) {
						// Treat as API key error even if requiresConfig flag is missing
						logMessage(
							`⚠️ API Configuration Error\n\n` +
							`${errorMsg}\n\n` +
							`Please check your WHOP_API_KEY and NEXT_PUBLIC_WHOP_APP_ID in .env.development\n` +
							`and restart your dev server.`
						);
					} else {
						logMessage(`⚠️ ${errorMsg}`);
					}
					
					if (responseData.details) {
						console.error("Error details:", responseData.details);
					}
					console.error("Full error response:", responseData);
				} else {
					// Fallback error message with status code
					const fallbackMessage = responseData.message || 
						responseData.error || 
						`Server returned ${response.status} ${response.statusText}` ||
						"Failed to save workout. Please check your connection and try again.";
					logMessage(`⚠️ ${fallbackMessage}`);
					console.error("Unknown error format - full response:", {
						status: response.status,
						statusText: response.statusText,
						responseData,
						responseDataKeys: Object.keys(responseData || {}),
						responseDataString: JSON.stringify(responseData)
					});
				}
				
				// Don't mark as saved if API failed
			}
		} catch (error) {
			console.error("❌ Error saving workout:", error);
			const errorMsg = `⚠️ Network error: ${error instanceof Error ? error.message : "Failed to save workout. Please try again."}`;
			if (shouldShowAlerts()) {
				alert(errorMsg);
			} else {
				console.warn("[Demo Mode] " + errorMsg);
			}
			// Don't mark as saved on error - let user try again
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
		console.log("triggerSpin called", { isSpinning, hasRandomizer: !!randomizer, selectedCategories: selectedCategories.length });
		
		if (isSpinning || !randomizer || selectedCategories.length === 0) {
			console.warn("Spin blocked:", { isSpinning, hasRandomizer: !!randomizer, selectedCategories: selectedCategories.length });
			return;
		}

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

		console.log("Subscription check:", currentSubscription);

		// Check if user has spins remaining
		if (!currentSubscription.hasUnlimitedGenerations && currentSubscription.freeSpinsRemaining < spinCount) {
			console.warn("Not enough spins remaining");
			setShowUpgradeModal(true);
			return;
		}

		// Reset state
		setIsSpinning(true);
		setResults([]);

		// Decrement free spins if not unlimited
		if (!currentSubscription.hasUnlimitedGenerations && currentSubscription.freeSpinsRemaining >= spinCount) {
			try {
				const response = await fetch("/api/subscription", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ spinsUsed: spinCount }),
				});
				
				if (response.ok) {
					// Safely parse response
					let respData: any = {};
					try {
						const text = await response.text();
						if (text) {
							respData = JSON.parse(text);
						}
					} catch (e) {
						// Ignore parse errors for success response
					}
					
					// Check if demo mode
					if (respData.demo) {
						console.log("📍 Demo mode - spin decrement simulated");
					}
					
					// Update local state immediately for better UX
					if (currentSubscription) {
						setSubscription({
							...currentSubscription,
							freeSpinsRemaining: Math.max(0, currentSubscription.freeSpinsRemaining - spinCount),
						});
					}
					// Reload subscription status to sync with server (only if not demo)
					if (!respData.demo) {
						loadSubscription();
					}
				} else {
					// Safely parse error response - read body once
					let errorData: any = {};
					try {
						const text = await response.text();
						if (text) {
							try {
								errorData = JSON.parse(text);
							} catch (parseError) {
								// Not JSON, use as plain text
								errorData = { 
									error: `Server returned ${response.status} ${response.statusText}`,
									message: text,
									status: response.status,
									statusText: response.statusText
								};
							}
						} else {
							// Empty response
							errorData = { 
								error: `Server returned ${response.status} ${response.statusText}`,
								message: "Empty response from server",
								status: response.status,
								statusText: response.statusText
							};
						}
					} catch (readError) {
						console.error("Failed to read error response body:", readError);
						errorData = { 
							error: "Failed to read response",
							message: readError instanceof Error ? readError.message : String(readError),
							status: response.status,
							statusText: response.statusText
						};
					}
					
					console.error("Failed to update free spins:", {
						status: response.status,
						statusText: response.statusText,
						url: response.url,
						errorData,
						hasError: !!errorData.error,
						hasMessage: !!errorData.message,
						errorKeys: Object.keys(errorData || {})
					});
					
					const showAlert = shouldShowAlerts();
					const logMessage = (msg: string) => {
						if (showAlert) {
							alert(msg);
						} else {
							console.warn("⚠️ [Demo Mode] " + msg.replace(/\n/g, " "));
						}
					};
					
					// Show helpful error message if not connected through Whop
					if (errorData.requiresWhopConnection) {
						if (showAlert) {
							alert(
								"⚠️ Authentication Required\n\n" +
								"Please access this app through Whop to test subscription features.\n\n" +
								"Steps:\n" +
								"1. Go to your Whop Dashboard\n" +
								"2. Navigate to Tools → Add App\n" +
								"3. Select your app and choose 'localhost' with port 3000\n\n" +
								"See WHOP_LOCALHOST_SETUP.md for detailed instructions."
							);
						} else {
							console.warn("⚠️ [Demo Mode] Free spin tracking requires Whop authentication. App is running in demo mode.");
						}
					} else if (errorData.message || errorData.error) {
						const errorMsg = errorData.message || errorData.error || `Server returned ${response.status} ${response.statusText}`;
						if (showAlert) {
							console.warn("Subscription update failed:", errorMsg);
						} else {
							console.warn("⚠️ [Demo Mode] Subscription update failed:", errorMsg);
						}
					} else {
						// Fallback message
						const fallbackMsg = `Failed to update free spins. Server returned ${response.status} ${response.statusText}`;
						if (showAlert) {
							console.warn(fallbackMsg);
						} else {
							console.warn("⚠️ [Demo Mode] " + fallbackMsg);
						}
					}
					
					// Update local state even if API fails (optimistic update)
					if (currentSubscription) {
						setSubscription({
							...currentSubscription,
							freeSpinsRemaining: Math.max(0, currentSubscription.freeSpinsRemaining - spinCount),
						});
					}
				}
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
		setTimeout(() => {
			try {
				if (!randomizer) {
					console.error("Randomizer is not initialized");
					setIsSpinning(false);
					return;
				}

			const newResults = randomizer.generateMultiple(spinCount, minSets, maxSets, minVolume, maxVolume);
				
				if (!newResults || newResults.length === 0) {
					console.error("No workouts generated");
					setIsSpinning(false);
					return;
				}

				// Store results and trigger pack opening animation
				setPendingResults(newResults);
				setIsSpinning(false);
				setShowPackOpening(true);
			} catch (error) {
				console.error("Error generating workouts:", error);
			setIsSpinning(false);
			}
		}, 2000); // 2 seconds as requested
	};

	// Handle pack opening completion
	const handlePackOpeningComplete = () => {
		// Now set the actual results
		setResults(pendingResults);
		setTotalSpinCount((prev) => prev + pendingResults.length);

		// Update history (keep last 20)
		setSpinHistory((prev) => {
			const updated = [...pendingResults, ...prev].slice(0, 20);
			return updated;
		});

		// Reset saved and completed workouts for new results
		setSavedWorkouts(new Set());
		setCompletedWorkouts(new Set());
		setShowPackOpening(false);
		
		// Clear pending results
		setPendingResults([]);
	};

	// Handle exercise completion with explosion animation
	const handleCompleteExercise = (index: number, event: React.MouseEvent) => {
		// Check if user can track completions (Premium only)
		const canTrack = subscription?.hasStorage || (isTestMode && testModeTier === "premium");
		
		if (!canTrack) {
			// Show styled upgrade prompt instead of browser confirm
			setUpgradePromptType("complete");
			setShowUpgradePrompt(true);
			return;
		}

		if (completedWorkouts.has(index)) {
			// Already completed, toggle off
			setCompletedWorkouts(prev => {
				const next = new Set(prev);
				next.delete(index);
				return next;
			});
			return;
		}

		// Get position for explosion
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		setExplosionPos({
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		});
		setShowExplosion(true);

		// Mark as completed
		setCompletedWorkouts(prev => new Set([...prev, index]));

		// Log to workout history as completed
		if (results[index]) {
			logCompletedWorkout(results[index]);
		}
	};

	// Log completed workout to history
	const logCompletedWorkout = async (workout: WorkoutResult) => {
		// Check if user can save (Premium only, or test mode with premium)
		const canSave = subscription?.hasStorage || (isTestMode && testModeTier === "premium");
		
		if (!canSave) {
			console.log("📍 Cannot log workout - Premium required");
			return;
		}

		const workoutWithTimestamp = {
			...workout,
			completedAt: new Date().toISOString(),
			id: `local-${Date.now()}`,
		};

		// In test mode, also save to localStorage for persistence
		if (isTestMode) {
			try {
				const existing = JSON.parse(localStorage.getItem("armchair-workout-history") || "[]");
				const completedWorkout = {
					...workoutWithTimestamp,
					saved: false, // This is a completed workout, not saved to collection
				};
				existing.unshift(completedWorkout);
				localStorage.setItem("armchair-workout-history", JSON.stringify(existing.slice(0, 100)));
				console.log("✅ Completed workout saved to localStorage!", completedWorkout);
			} catch (e) {
				console.error("Failed to save to localStorage:", e);
			}
		}

		// Also try API (will succeed in test mode with simulated response)
		try {
			console.log("📝 Logging completed workout:", workout.workout);
			// Add saved: false to indicate this is a "completed" workout, not saved to collection
			const completedWorkoutData = {
				...workoutWithTimestamp,
				saved: false, // This is a completed workout
			};
			
			const response = await fetch("/api/workout-history", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					workouts: [completedWorkoutData],
				}),
			});
			
			let data: any = {};
			try {
				const text = await response.text();
				if (text) {
					data = JSON.parse(text);
				}
			} catch {
				// Ignore parse errors
			}
			
			if (response.ok) {
				console.log("✅ Workout logged!", data);
			} else if (data.testMode || data.demo) {
				// In test/demo mode, this is expected - workout is saved locally
				console.log("📍 Test/demo mode - workout saved locally");
			} else {
				console.warn("⚠️ API returned error (workout still saved locally):", data.message || data.error || "Unknown error");
			}
		} catch (error) {
			// In test mode, network errors are expected - workout is saved locally
			if (isTestMode) {
				console.log("📍 Test mode - workout saved locally (API unavailable)");
			} else {
				console.warn("⚠️ API call failed (workout still saved locally):", error instanceof Error ? error.message : "Unknown error");
			}
		}
	};

	return (
		<div className="min-h-screen flex flex-col relative overflow-hidden" style={{
			background: "#000000",
		}}>
			{/* Header Status Bar */}
			<div className="w-full pt-4 z-10 relative">
				<HeaderStatusBar status="online" ready={!loadingWorkouts} isDemo={isDemo} isTestMode={isTestMode} testModeTier={testModeTier} />
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

			{/* Styled Upgrade Prompt Modal - replaces browser confirm() */}
			<AnimatePresence>
				{showUpgradePrompt && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/90 z-[998]"
							onClick={() => setShowUpgradePrompt(false)}
						/>
						{/* Modal */}
						<motion.div
							initial={{ opacity: 0, scale: 0.8, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.8, y: 20 }}
							transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
							className="fixed inset-0 z-[999] flex items-center justify-center p-4 pointer-events-none"
						>
							<div 
								className="rounded-2xl p-8 max-w-md w-full pointer-events-auto relative"
								style={{
									background: "linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(20,10,40,0.98) 100%)",
									border: "3px solid #FFD700",
									boxShadow: "0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 40px rgba(255, 215, 0, 0.1)",
								}}
							>
								{/* Corner brackets */}
								<div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[#FFD700]" />
								<div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[#FFD700]" />
								<div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[#FFD700]" />
								<div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[#FFD700]" />

								{/* Header */}
								<div className="text-center mb-6">
									<div className="text-4xl mb-2">⭐</div>
									<h2 
										className="text-2xl font-bold uppercase tracking-wider"
										style={{ 
											fontFamily: "'Orbitron', sans-serif",
											color: "#FFD700",
											textShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
										}}
									>
										Premium Feature
									</h2>
								</div>

								{/* Content */}
								<div className="mb-6">
									<p 
										className="text-center text-lg mb-4"
										style={{ 
											fontFamily: "'Courier New', monospace",
											color: "#FFFFFF",
										}}
									>
										{upgradePromptType === "save" 
											? "Saving workouts requires Premium."
											: "Tracking completed workouts requires Premium."
										}
									</p>
									
									{/* Current plan info */}
									{(subscription?.tier === "standard" || (isTestMode && testModeTier === "standard")) && (
										<div 
											className="p-3 rounded-lg mb-4"
											style={{ background: "rgba(0, 255, 127, 0.1)", border: "1px solid rgba(0, 255, 127, 0.3)" }}
										>
											<p className="text-[#00FF7F] text-sm" style={{ fontFamily: "'Courier New', monospace" }}>
												Your Standard plan includes:
											</p>
											<p className="text-white/70 text-sm">✓ Unlimited workout spins</p>
										</div>
									)}

									{/* Premium benefits */}
									<div 
										className="p-3 rounded-lg"
										style={{ background: "rgba(255, 215, 0, 0.1)", border: "1px solid rgba(255, 215, 0, 0.3)" }}
									>
										<p className="text-[#FFD700] text-sm mb-2" style={{ fontFamily: "'Courier New', monospace" }}>
											Premium includes:
										</p>
										<div className="text-white/80 text-sm space-y-1">
											<p>✓ Unlimited workout spins</p>
											<p>✓ Save & track workouts</p>
											<p>✓ Workout history dashboard</p>
											<p>✓ Progress analytics</p>
										</div>
									</div>
								</div>

								{/* Buttons */}
								<div className="flex gap-3">
									<motion.button
										onClick={() => setShowUpgradePrompt(false)}
										className="flex-1 px-4 py-3 rounded-lg font-bold uppercase tracking-wider"
										style={{
											fontFamily: "'Orbitron', sans-serif",
											background: "rgba(255, 255, 255, 0.1)",
											border: "2px solid rgba(255, 255, 255, 0.3)",
											color: "#FFFFFF",
										}}
										whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.5)" }}
										whileTap={{ scale: 0.98 }}
									>
										Cancel
									</motion.button>
									<motion.button
										onClick={() => {
											setShowUpgradePrompt(false);
											setShowUpgradeModal(true);
										}}
										className="flex-1 px-4 py-3 rounded-lg font-bold uppercase tracking-wider"
										style={{
											fontFamily: "'Orbitron', sans-serif",
											background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)",
											border: "2px solid #FFD700",
											color: "#000",
											boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
										}}
										whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255, 215, 0, 0.8)" }}
										whileTap={{ scale: 0.98 }}
									>
										Upgrade
									</motion.button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Landing Animation - Shows on first visit */}
			{showLandingAnimation && (
				<LandingAnimation
					onComplete={() => {
						setShowLandingAnimation(false);
						// Mark as seen so it doesn't show again
						if (typeof window !== "undefined") {
							localStorage.setItem("armchair-workouts-intro-seen", "true");
						}
					}}
					skipable={true}
				/>
			)}

			{/* FIFA-style Pack Opening Animation */}
			<PackOpeningAnimation
				workouts={pendingResults}
				isOpen={showPackOpening}
				onComplete={handlePackOpeningComplete}
				onClose={() => {
					// If user skips, still show results
					handlePackOpeningComplete();
				}}
			/>

			{/* Exercise Completion Explosion */}
			<ExerciseCompletionExplosion
				isVisible={showExplosion}
				x={explosionPos?.x || 0}
				y={explosionPos?.y || 0}
				onComplete={() => setShowExplosion(false)}
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
							&gt; ARMCHAIR_WORKOUTS v2.0 READY
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
								onSaveWorkout={handleSaveWorkout}
								onCompleteWorkout={handleCompleteExercise}
								savedWorkouts={savedWorkouts}
								completedWorkouts={completedWorkouts}
							/>
						)}

						{/* Action Buttons for Single Spin */}
						{spinCount === 1 && results[0] && !isSpinning && (
							<div className="mt-6 flex justify-center gap-4">
								{/* Complete Exercise Button */}
								<motion.button
									onClick={(e) => handleCompleteExercise(0, e)}
									className="px-6 py-3 border-2 rounded font-mono text-sm font-bold uppercase transition-all relative overflow-hidden"
									style={
										completedWorkouts.has(0)
											? {
													borderColor: "#00FF00",
													background: "rgba(0, 255, 0, 0.2)",
													color: "#00FF00",
													boxShadow: "0 0 20px rgba(0, 255, 0, 0.6)",
													textShadow: "0 0 8px rgba(0, 255, 0, 0.8)",
												}
											: {
													borderColor: "#FFD700",
													background: "rgba(255, 215, 0, 0.05)",
													color: "#FFD700",
													boxShadow: "0 0 15px rgba(255, 215, 0, 0.4)",
													textShadow: "0 0 8px rgba(255, 215, 0, 0.8)",
												}
									}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
								>
									{completedWorkouts.has(0) ? (
										<span className="relative z-10 flex items-center gap-2">
											<span>✅</span>
											<span>COMPLETED!</span>
										</span>
									) : (
										<span className="relative z-10 flex items-center gap-2">
											<span>💪</span>
											<span>MARK DONE</span>
										</span>
									)}
								</motion.button>

								{/* Save to Collection Button */}
								<motion.button
									onClick={() => handleSaveWorkout(results[0], 0)}
									disabled={savedWorkouts.has(0)}
									data-workout-index={0}
									className="px-6 py-3 border-2 rounded font-mono text-sm font-bold uppercase transition-all relative overflow-hidden"
									style={
										savedWorkouts.has(0)
											? {
													borderColor: "#00FF00",
													background: "rgba(0, 255, 0, 0.1)",
													color: "#00FF00",
													boxShadow: "0 0 15px rgba(0, 255, 0, 0.5)",
													textShadow: "0 0 8px rgba(0, 255, 0, 0.8)",
													cursor: "default",
												}
											: {
													borderColor: "#00FFFF",
													background: "rgba(0, 255, 255, 0.05)",
													color: "#00FFFF",
										boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
													textShadow: "0 0 8px rgba(0, 255, 255, 0.8)",
												}
									}
									whileHover={!savedWorkouts.has(0) ? { scale: 1.05 } : {}}
									whileTap={!savedWorkouts.has(0) ? { scale: 0.95 } : {}}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
								>
									{savedWorkouts.has(0) ? (
										<span className="relative z-10 flex items-center gap-2">
											<span>📁</span>
											<span>SAVED</span>
										</span>
									) : (
										<span className="relative z-10 flex items-center gap-2">
											<span>💾</span>
											<span>SAVE</span>
										</span>
									)}
								</motion.button>
							</div>
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
						ARMCHAIR WORKOUTS // TBLOCK SYSTEM
					</p>
				</div>
			</footer>
		</div>
	);
}

