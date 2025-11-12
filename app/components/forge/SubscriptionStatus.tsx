"use client";

import { motion } from "framer-motion";
import type { SubscriptionStatus } from "@/app/api/subscription/route";

interface SubscriptionStatusProps {
	subscription: SubscriptionStatus;
	onUpgrade?: () => void;
}

export default function SubscriptionStatusBar({ subscription, onUpgrade }: SubscriptionStatusProps) {
	if (subscription.tier === "premium") {
		return (
			<div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mb-4 border-2 border-[#00FFFF]" style={{
				boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
			}}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-white font-semibold text-lg" style={{
							fontFamily: "'Orbitron', sans-serif",
							textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
						}}>⭐ Premium Member</span>
						<span className="text-white/80 text-sm">Unlimited + Storage + Analytics</span>
					</div>
				</div>
			</div>
		);
	}

	if (subscription.tier === "standard") {
		return (
			<div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mb-4 border-2 border-[#00FFFF]" style={{
				boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
			}}>
				<div className="flex items-center justify-between flex-wrap gap-3">
					<div className="flex items-center gap-2">
						<span className="text-white font-semibold text-lg" style={{
							fontFamily: "'Orbitron', sans-serif",
							textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
						}}>✓ Standard Member</span>
						<span className="text-white/80 text-sm">Unlimited Generations</span>
					</div>
					{onUpgrade && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={onUpgrade}
							className="px-6 py-3 border-2 rounded font-mono text-sm font-bold uppercase transition-all"
							style={{
								borderColor: "#00FFFF",
								background: "rgba(0, 255, 255, 0.1)",
								color: "#00FFFF",
								boxShadow: "0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2)",
								textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
							}}
						>
							UPGRADE TO PREMIUM
						</motion.button>
					)}
				</div>
			</div>
		);
	}

	// Free tier
	return (
		<div className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg mb-4 border-2 border-[#00FFFF]" style={{
			boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
		}}>
			<div className="flex items-center justify-between flex-wrap gap-3">
				<div className="flex items-center gap-3">
					<span className="text-white font-semibold text-lg" style={{
						fontFamily: "'Orbitron', sans-serif",
						textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
					}}>
						FREE SPINS: <span className="text-[#00FFFF]" style={{
							textShadow: "0 0 15px rgba(0, 255, 255, 1)",
							fontSize: "1.2em",
						}}>{subscription.freeSpinsRemaining}</span> REMAINING
					</span>
				</div>
				{onUpgrade && (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={onUpgrade}
						className="px-8 py-4 border-2 rounded font-mono text-base font-bold uppercase transition-all animate-pulse"
						style={{
							borderColor: "#00FFFF",
							background: "linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1))",
							color: "#00FFFF",
							boxShadow: "0 0 30px rgba(0, 255, 255, 0.6), inset 0 0 15px rgba(0, 255, 255, 0.3)",
							textShadow: "0 0 15px rgba(0, 255, 255, 1), 0 0 25px rgba(0, 255, 255, 0.8)",
						}}
					>
						UPGRADE
					</motion.button>
				)}
			</div>
		</div>
	);
}

