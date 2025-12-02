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

	// Get free spins remaining from database and track user subscription
	let freeSpinsRemaining = 3; // Default for new users
	try {
		const { data: userData, error: fetchError } = await supabaseAdmin
			.from("user_subscriptions")
			.select("free_spins_remaining, tier")
			.eq("user_id", userId)
			.maybeSingle();

		if (fetchError) {
			// Table might not exist - just log and continue
			console.warn("Could not fetch user subscription (table may not exist):", fetchError.message);
		} else if (userData) {
			freeSpinsRemaining = userData.free_spins_remaining ?? 0;
			console.log(`📊 User ${userId} subscription loaded: tier=${userData.tier}, spins=${freeSpinsRemaining}`);
		} else {
			// First time user - initialize with 3 free spins and track their tier
			console.log(`📝 Creating subscription record for new user ${userId}`);
			const { error: insertError } = await supabaseAdmin
				.from("user_subscriptions")
				.insert({
					user_id: userId,
					free_spins_remaining: 3,
					tier: tier, // Use the tier we determined from Whop
					whop_product_id: userProducts[0] || null,
				});
			
			if (insertError) {
				console.warn("Could not create user subscription:", insertError.message);
			} else {
				console.log(`✅ Created subscription record for user ${userId} with tier: ${tier}`);
			}
			freeSpinsRemaining = 3;
		}
		
		// Update tier if it changed (e.g., user upgraded)
		if (userData && userData.tier !== tier) {
			console.log(`📈 Updating user ${userId} tier: ${userData.tier} → ${tier}`);
			await supabaseAdmin
				.from("user_subscriptions")
				.update({ 
					tier: tier,
					whop_product_id: userProducts[0] || null,
					updated_at: new Date().toISOString()
				})
				.eq("user_id", userId);
		}
	} catch (error) {
		console.warn("Could not fetch/update free spins, using default:", error);
	}

	return {
		tier,
		hasUnlimitedGenerations: hasStandard || hasPremium, // Standard & Premium get unlimited spins
		hasStorage: hasPremium, // Only Premium can save workouts
		hasAnalytics: hasPremium, // Only Premium can view analytics
		freeSpinsRemaining: tier === "free" ? freeSpinsRemaining : Infinity,
		products: userProducts,
	};
}

