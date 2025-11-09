"use client";

import { Button } from "@whop/react/components";
import type { SubscriptionStatus } from "@/app/api/subscription/route";

interface SubscriptionStatusProps {
	subscription: SubscriptionStatus;
	onUpgrade?: () => void;
}

export default function SubscriptionStatusBar({ subscription, onUpgrade }: SubscriptionStatusProps) {
	if (subscription.tier === "premium") {
		return (
			<div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mb-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-white font-semibold">⭐ Premium Member</span>
						<span className="text-white/80 text-sm">Unlimited + Storage + Analytics</span>
					</div>
				</div>
			</div>
		);
	}

	if (subscription.tier === "standard") {
		return (
			<div className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mb-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-white font-semibold">✓ Standard Member</span>
						<span className="text-white/80 text-sm">Unlimited Generations</span>
					</div>
					{onUpgrade && (
						<Button
							variant="classic"
							size="2"
							onClick={onUpgrade}
							className="bg-white text-green-600 hover:bg-green-50"
						>
							Upgrade to Premium
						</Button>
					)}
				</div>
			</div>
		);
	}

	// Free tier
	return (
		<div className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg mb-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-white font-semibold">
						Free Spins: {subscription.freeSpinsRemaining} remaining
					</span>
				</div>
				{onUpgrade && (
					<Button
						variant="classic"
						size="2"
						onClick={onUpgrade}
						className="bg-white text-orange-600 hover:bg-orange-50"
					>
						Upgrade
					</Button>
				)}
			</div>
		</div>
	);
}

