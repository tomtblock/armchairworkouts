"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@whop/react/components";

interface UpgradeModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentTier: "free" | "standard" | "premium";
	standardProductUrl?: string;
	premiumProductUrl?: string;
}

export default function UpgradeModal({
	isOpen,
	onClose,
	currentTier,
	standardProductUrl,
	premiumProductUrl,
}: UpgradeModalProps) {
	if (!isOpen) return null;

	const handleUpgrade = (tier: "standard" | "premium") => {
		const url = tier === "standard" ? standardProductUrl : premiumProductUrl;
		if (url) {
			window.open(url, "_blank");
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
					>
						{/* Modal */}
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-black border-2 border-[#00FFFF] rounded-lg p-6 max-w-md w-full"
							style={{
								boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)",
							}}
						>
							<h2 className="text-2xl font-bold mb-4 text-[#00FFFF]">Upgrade Your Plan</h2>

							{currentTier === "free" && (
								<div className="space-y-4">
									{/* Standard Plan */}
									<div className="border border-[#00FFFF] rounded-lg p-4">
										<h3 className="text-xl font-semibold mb-2 text-white">Standard - £1.99/month</h3>
										<ul className="text-gray-300 space-y-1 mb-4 text-sm">
											<li>✓ Unlimited workout generations</li>
											<li>✗ No storage</li>
											<li>✗ No analytics</li>
										</ul>
										<Button
											variant="classic"
											onClick={() => handleUpgrade("standard")}
											className="w-full"
											style={{
												border: "2px solid #00FFFF",
											}}
										>
											Upgrade to Standard
										</Button>
									</div>

									{/* Premium Plan */}
									<div className="border-2 border-[#00FFFF] rounded-lg p-4 bg-[#00FFFF]/10">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="text-xl font-semibold text-white">Premium - £3.99/month</h3>
											<span className="text-xs bg-[#00FFFF] text-black px-2 py-1 rounded">BEST VALUE</span>
										</div>
										<ul className="text-gray-300 space-y-1 mb-4 text-sm">
											<li>✓ Unlimited workout generations</li>
											<li>✓ Workout history storage</li>
											<li>✓ Analytics dashboard</li>
										</ul>
										<Button
											variant="classic"
											onClick={() => handleUpgrade("premium")}
											className="w-full"
											style={{
												border: "2px solid #00FFFF",
												background: "#00FFFF",
												color: "#000",
											}}
										>
											Upgrade to Premium
										</Button>
									</div>
								</div>
							)}

							{currentTier === "standard" && (
								<div className="border-2 border-[#00FFFF] rounded-lg p-4 bg-[#00FFFF]/10">
									<div className="flex items-center gap-2 mb-2">
										<h3 className="text-xl font-semibold text-white">Premium - £3.99/month</h3>
										<span className="text-xs bg-[#00FFFF] text-black px-2 py-1 rounded">UPGRADE</span>
									</div>
									<ul className="text-gray-300 space-y-1 mb-4 text-sm">
										<li>✓ Everything in Standard</li>
										<li>✓ Workout history storage</li>
										<li>✓ Analytics dashboard</li>
									</ul>
									<Button
										variant="classic"
										onClick={() => handleUpgrade("premium")}
										className="w-full"
										style={{
											border: "2px solid #00FFFF",
											background: "#00FFFF",
											color: "#000",
										}}
									>
										Upgrade to Premium
									</Button>
								</div>
							)}

							<Button
								variant="classic"
								onClick={onClose}
								className="w-full mt-4"
								style={{
									border: "1px solid #666",
								}}
							>
								Close
							</Button>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

