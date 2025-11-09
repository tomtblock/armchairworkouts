import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import type { SubscriptionStatus, SubscriptionTier } from "./route";

// Environment variables for product IDs (set these in your Whop dashboard)
const STANDARD_PRODUCT_ID = process.env.WHOP_STANDARD_PRODUCT_ID || "";
const PREMIUM_PRODUCT_ID = process.env.WHOP_PREMIUM_PRODUCT_ID || "";

// Test mode: Set ENABLE_TEST_MODE=true to grant all features for testing
const TEST_MODE_ENABLED = process.env.ENABLE_TEST_MODE === "true" || process.env.TEST_MODE_ENABLED === "true";

export async function checkUserSubscription(
	userId: string,
	headersList?: Headers
): Promise<SubscriptionStatus> {
	// TEST MODE: Grant all features for testing
	if (TEST_MODE_ENABLED) {
		return {
			tier: "premium",
			hasUnlimitedGenerations: true,
			hasStorage: true,
			hasAnalytics: true,
			freeSpinsRemaining: Infinity,
			products: ["test-mode"],
		};
	}

	// Check which products user has access to
	const userProducts: string[] = [];
	let hasStandard = false;
	let hasPremium = false;

	// If product IDs are configured, check access
	if (STANDARD_PRODUCT_ID) {
		try {
			const standardAccess = await whopsdk.users.checkAccess(STANDARD_PRODUCT_ID, { id: userId });
			if (standardAccess.has_access) {
				userProducts.push(STANDARD_PRODUCT_ID);
				hasStandard = true;
			}
		} catch (e) {
			console.warn("Could not check standard product access:", e);
		}
	}

	if (PREMIUM_PRODUCT_ID) {
		try {
			const premiumAccess = await whopsdk.users.checkAccess(PREMIUM_PRODUCT_ID, { id: userId });
			if (premiumAccess.has_access) {
				userProducts.push(PREMIUM_PRODUCT_ID);
				hasPremium = true;
			}
		} catch (e) {
			console.warn("Could not check premium product access:", e);
		}
	}

	// Determine tier
	let tier: SubscriptionTier = "free";
	if (hasPremium) {
		tier = "premium";
	} else if (hasStandard) {
		tier = "standard";
	}

	// Get free spins remaining from database
	let freeSpinsRemaining = 2; // Default
	try {
		const { data: userData } = await supabaseAdmin
			.from("user_subscriptions")
			.select("free_spins_remaining")
			.eq("user_id", userId)
			.single();

		if (userData) {
			freeSpinsRemaining = userData.free_spins_remaining || 0;
		} else {
			// First time user - initialize with 2 free spins
			await supabaseAdmin
				.from("user_subscriptions")
				.insert({
					user_id: userId,
					free_spins_remaining: 2,
					tier: "free",
				});
			freeSpinsRemaining = 2;
		}
	} catch (error) {
		console.warn("Could not fetch free spins, using default:", error);
	}

	return {
		tier,
		hasUnlimitedGenerations: hasStandard || hasPremium,
		hasStorage: hasPremium,
		hasAnalytics: hasPremium,
		freeSpinsRemaining: tier === "free" ? freeSpinsRemaining : Infinity,
		products: userProducts,
	};
}

