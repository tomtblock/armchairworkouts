"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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
	const [productIds, setProductIds] = useState<{ standardProductId: string; premiumProductId: string } | null>(null);

	useEffect(() => {
		// Fetch product IDs from API
		fetch("/api/checkout/product-ids")
			.then(res => res.json())
			.then(data => setProductIds(data))
			.catch(err => console.error("Failed to fetch product IDs:", err));
	}, []);

	if (!isOpen) return null;

	const handleUpgrade = async (tier: "standard" | "premium") => {
		// If URLs are provided, use them
		const url = tier === "standard" ? standardProductUrl : premiumProductUrl;
		if (url) {
			window.location.href = url;
			return;
		}

		// Get product ID
		const productId = tier === "standard" 
			? productIds?.standardProductId 
			: productIds?.premiumProductId;

		if (!productId) {
			console.error(`Product ID not configured for ${tier} tier`);
			alert(`Product configuration missing. Please contact support.`);
			return;
		}

		// Create checkout URL via API
		try {
			const response = await fetch("/api/checkout/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ productId }),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.checkoutUrl) {
					// Open checkout in same window to maintain Whop session
					window.location.href = data.checkoutUrl;
				} else {
					console.error("No checkout URL returned");
					alert("Failed to create checkout link. Please try again.");
				}
			} else {
				const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
				console.error("Failed to create checkout:", errorData);
				alert("Failed to create checkout link. Please try again.");
			}
		} catch (error) {
			console.error("Error creating checkout:", error);
			alert("An error occurred. Please try again.");
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

