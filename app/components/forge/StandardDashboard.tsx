"use client";

import { useState, useEffect } from "react";
import HeaderStatusBar from "./HeaderStatusBar";
import type { SubscriptionStatus } from "@/app/api/subscription/route";

export default function StandardDashboard() {
	const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

	useEffect(() => {
		loadSubscription();
	}, []);

	const loadSubscription = async () => {
		try {
			const response = await fetch("/api/subscription");
			if (response.ok) {
				const data = await response.json();
				setSubscription(data);
			}
		} catch (error) {
			console.error("Failed to load subscription:", error);
		}
	};

	return (
		<div className="min-h-screen flex flex-col relative overflow-hidden" style={{
			background: "#000000",
		}}>
			{/* Header Status Bar */}
			<div className="w-full pt-4 z-10 relative">
				<HeaderStatusBar status="online" ready={true} />
			</div>

			{/* Subscription Status */}
			{subscription && (
				<div className="px-4 z-10 relative">
					<div className="px-4 py-2 rounded-lg mb-4 bg-gradient-to-r from-green-600 to-emerald-600">
						<div className="flex items-center gap-2">
							<span className="text-white font-semibold">✓ Standard Member</span>
							<span className="text-white/80 text-sm">Unlimited Generations</span>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="flex-1 px-4 pb-4 z-10 relative overflow-y-auto">
				{/* Terminal Window */}
				<div className="terminal-window scanline rounded-lg p-6 md:p-8 min-h-[600px]" style={{
					border: "2px solid #00FFFF",
					boxShadow: "inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 30px rgba(0, 255, 255, 0.3)",
				}}>
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

					{/* Terminal Header */}
					<div className="mb-6">
						<h1 className="text-4xl font-bold mb-2" style={{
							fontFamily: "'Orbitron', sans-serif",
							color: "#00FFFF",
							textShadow: "0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)",
						}}>
							STANDARD DASHBOARD
						</h1>
						<p className="text-2" style={{
							fontFamily: "'Courier New', monospace",
							color: "#00FF00",
							textShadow: "0 0 10px rgba(0, 255, 0, 0.8)",
						}}>
							&gt; VIEW-ONLY MODE
						</p>
					</div>

					{/* Upgrade Prompt */}
					<div className="border border-[#00FFFF] rounded-lg p-6 bg-black/30 mb-6" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)",
					}}>
						<h3 className="text-xl font-bold mb-4" style={{
							fontFamily: "'Orbitron', sans-serif",
							color: "#00FFFF",
							textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
						}}>
							UPGRADE TO PREMIUM
						</h3>
						<p className="text-gray-300 mb-4" style={{
							fontFamily: "'Courier New', monospace",
						}}>
							&gt; UNLOCK FULL DASHBOARD FEATURES
						</p>
						<div className="space-y-2 text-left mb-4">
							<div className="text-white flex items-center gap-2">
								<span className="text-[#00FF00]">✓</span>
								<span>Save workout history</span>
							</div>
							<div className="text-white flex items-center gap-2">
								<span className="text-[#00FF00]">✓</span>
								<span>Add comments to workouts</span>
							</div>
							<div className="text-white flex items-center gap-2">
								<span className="text-[#00FF00]">✓</span>
								<span>View complete workout timeline</span>
							</div>
							<div className="text-white flex items-center gap-2">
								<span className="text-[#00FF00]">✓</span>
								<span>Track cumulative exercise stats</span>
							</div>
							<div className="text-white flex items-center gap-2">
								<span className="text-[#00FF00]">✓</span>
								<span>Analytics and insights</span>
							</div>
						</div>
						<div className="p-4 border border-[#00FFFF] rounded mb-4" style={{
							background: "rgba(0, 255, 255, 0.1)",
						}}>
							<p className="text-[#00FFFF] font-semibold text-xl mb-2" style={{
								fontFamily: "'Orbitron', sans-serif",
							}}>
								£3.99/month
							</p>
							<p className="text-gray-400 text-sm">
								Upgrade to Premium for full dashboard access
							</p>
						</div>
					</div>

					{/* Info Section */}
					<div className="border border-[#00FFFF]/50 rounded-lg p-4 bg-black/20">
						<p className="text-gray-400 text-sm" style={{
							fontFamily: "'Courier New', monospace",
						}}>
							&gt; Standard members have unlimited workout generations
						</p>
						<p className="text-gray-500 text-xs mt-2" style={{
							fontFamily: "'Courier New', monospace",
						}}>
							&gt; Upgrade to Premium to save workouts and access full analytics
						</p>
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
						STANDARD DASHBOARD // TBLOCK SYSTEM
					</p>
				</div>
			</footer>
		</div>
	);
}

