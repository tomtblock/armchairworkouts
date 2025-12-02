"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@whop/react/components";
import { shouldShowAlerts } from "@/lib/whop-utils";

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
	const [isLoading, setIsLoading] = useState<string | null>(null);
	
	if (!isOpen) return null;

	const handleUpgrade = async (tier: "standard" | "premium") => {
		console.log("🔄 handleUpgrade called with tier:", tier);
		setIsLoading(tier);
		
		// If URLs are provided, use them
		const url = tier === "standard" ? standardProductUrl : premiumProductUrl;
		if (url) {
			console.log("📍 Using provided URL:", url);
			window.location.href = url;
			return;
		}

		// Create checkout URL via API (pass tier instead of productId)
		try {
			console.log("📡 Calling /api/checkout/create with tier:", tier);
			const response = await fetch("/api/checkout/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tier }),
			});
			
			console.log("📥 Response received:", {
				ok: response.ok,
				status: response.status,
				statusText: response.statusText,
				url: response.url
			});

			if (response.ok) {
				const data = await response.json();
				console.log("✅ Checkout data received:", data);
				if (data.checkoutUrl) {
					// Store a flag to refresh subscription when user returns
					if (typeof window !== "undefined") {
						sessionStorage.setItem("pendingUpgrade", tier);
					}
					console.log("🔗 Opening checkout URL:", data.checkoutUrl);
					
					// Try multiple methods to open the checkout
					// Method 1: Open in new tab/window (works best in iframes)
					const newWindow = window.open(data.checkoutUrl, "_blank");
					
					if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
						// Popup was blocked, try parent redirect if in iframe
						console.log("📍 Popup blocked, trying alternative redirect methods...");
						
						try {
							// Method 2: Try to redirect the parent window (if in iframe)
							if (window.parent !== window) {
								window.parent.location.href = data.checkoutUrl;
							} else {
								// Method 3: Direct redirect as fallback
								window.location.href = data.checkoutUrl;
							}
						} catch (e) {
							// Method 4: If all else fails, show the URL to user
							console.error("Could not redirect:", e);
							setIsLoading(null);
							alert(`Please visit this URL to complete your purchase:\n\n${data.checkoutUrl}`);
						}
					} else {
						// Successfully opened in new window
						setIsLoading(null);
						onClose();
					}
				} else {
					console.error("❌ No checkout URL returned in response:", data);
					setIsLoading(null);
					if (shouldShowAlerts()) {
						alert("Failed to create checkout link. Please try again.");
					} else {
						console.warn("⚠️ [Demo Mode] No checkout URL returned");
					}
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
				
				console.error("Failed to create checkout:", {
					status: response.status,
					statusText: response.statusText,
					url: response.url,
					errorData,
					hasError: !!errorData.error,
					hasMessage: !!errorData.message,
					errorKeys: Object.keys(errorData || {})
				});
				
				const showAlert = shouldShowAlerts();
				
				// Show helpful error message if not connected through Whop
				if (errorData.requiresWhopConnection) {
					if (showAlert) {
						alert(
							"⚠️ Authentication Required\n\n" +
							"Please access this app through Whop to test checkout functionality.\n\n" +
							"Steps:\n" +
							"1. Go to your Whop Dashboard\n" +
							"2. Navigate to Tools → Add App\n" +
							"3. Select your app and choose 'localhost' with port 3000\n\n" +
							"See WHOP_LOCALHOST_SETUP.md for detailed instructions."
						);
					} else {
						console.warn("⚠️ [Demo Mode] Checkout requires Whop authentication. App is running in demo mode.");
					}
				} else if (errorData.requiresConfig) {
					// Checkout configuration error - show setup steps
					setIsLoading(null);
					
					// Build setup steps message
					let setupMessage = `⚠️ Checkout Setup Required\n\n`;
					setupMessage += `${errorData.message || "Checkout not configured"}\n\n`;
					
					if (errorData.setupSteps && Array.isArray(errorData.setupSteps)) {
						setupMessage += "Setup Steps:\n";
						errorData.setupSteps.forEach((step: string, i: number) => {
							setupMessage += `${i + 1}. ${step}\n`;
						});
					} else if (errorData.hint) {
						setupMessage += errorData.hint;
					} else {
						setupMessage += `To configure checkout:\n`;
						setupMessage += `1. Go to Whop Dashboard > Products\n`;
						setupMessage += `2. Click on your product and go to Plans\n`;
						setupMessage += `3. Copy the plan ID (plan_xxxxx)\n`;
						setupMessage += `4. Add WHOP_STANDARD_PLAN_ID and WHOP_PREMIUM_PLAN_ID to .env.development\n`;
						setupMessage += `5. Restart your dev server\n`;
					}
					
					if (showAlert) {
						alert(setupMessage);
					} else {
						console.warn("⚠️ [Demo Mode] " + setupMessage.replace(/\n/g, " "));
					}
					console.log("Checkout setup required:", errorData);
				} else {
					// Show more helpful error message
					const errorMessage = errorData.message || errorData.error || `Failed to create checkout link (HTTP ${response.status}). Please try again.`;
					if (showAlert) {
						alert(`⚠️ ${errorMessage}`);
					} else {
						console.warn("⚠️ [Demo Mode] " + errorMessage);
					}
				}
			}
		} catch (error) {
			console.error("❌ Error creating checkout:", error);
			setIsLoading(null);
			if (shouldShowAlerts()) {
				alert("An error occurred. Please try again.");
			} else {
				console.warn("⚠️ [Demo Mode] Checkout error occurred. App is running in demo mode.");
			}
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
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleUpgrade("standard");
											}}
											disabled={isLoading !== null}
											className="w-full"
											style={{
												border: "2px solid #00FFFF",
												opacity: isLoading === "standard" ? 0.6 : 1,
											}}
										>
											{isLoading === "standard" ? "Loading..." : "Upgrade to Standard"}
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
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleUpgrade("premium");
											}}
											disabled={isLoading !== null}
											className="w-full"
											style={{
												border: "2px solid #00FFFF",
												background: "#00FFFF",
												color: "#000",
												opacity: isLoading === "premium" ? 0.6 : 1,
											}}
										>
											{isLoading === "premium" ? "Loading..." : "Upgrade to Premium"}
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
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											handleUpgrade("premium");
										}}
										disabled={isLoading !== null}
										className="w-full"
										style={{
											border: "2px solid #00FFFF",
											background: "#00FFFF",
											color: "#000",
											opacity: isLoading === "premium" ? 0.6 : 1,
										}}
									>
										{isLoading === "premium" ? "Loading..." : "Upgrade to Premium"}
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

