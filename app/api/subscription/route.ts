import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { checkUserSubscription } from "./check";

export type SubscriptionTier = "free" | "standard" | "premium" | null;

export interface SubscriptionStatus {
	tier: SubscriptionTier;
	hasUnlimitedGenerations: boolean;
	hasStorage: boolean;
	hasAnalytics: boolean;
	freeSpinsRemaining: number;
	products: string[]; // Product IDs user has access to
}

// Check if test mode is enabled via env var or cookie
function isTestModeEnabled(request: NextRequest): boolean {
	// Check environment variable
	if (process.env.ENABLE_TEST_MODE === "true" || process.env.TEST_MODE_ENABLED === "true") {
		return true;
	}
	// Check cookie (set via ?testmode=premium URL param)
	const testModeCookie = request.cookies.get("armchair-test-mode")?.value;
	if (testModeCookie === "premium" || testModeCookie === "standard") {
		return true;
	}
	return false;
}

function getTestModeTier(request: NextRequest): SubscriptionTier {
	const testModeCookie = request.cookies.get("armchair-test-mode")?.value;
	if (testModeCookie === "standard") return "standard";
	return "premium"; // Default test mode tier
}

export async function GET(request: NextRequest) {
	// Check for test mode activation via URL param
	const url = new URL(request.url);
	const testModeParam = url.searchParams.get("testmode");
	
	// If testmode param is set, create response with cookie
	if (testModeParam === "premium" || testModeParam === "standard" || testModeParam === "off") {
		const isOff = testModeParam === "off";
		const testTier: "standard" | "premium" | null = isOff ? null : testModeParam;
		// Standard: Only unlimited spins
		// Premium: Unlimited spins + Storage + Analytics
		const testStatus: SubscriptionStatus & { demo: boolean; testMode: boolean; message: string } = {
			tier: isOff ? "free" : testTier!,
			hasUnlimitedGenerations: !isOff && testTier !== null, // Both Standard & Premium
			hasStorage: testTier === "premium", // Only Premium can save
			hasAnalytics: testTier === "premium", // Only Premium can view analytics
			freeSpinsRemaining: isOff ? 2 : Infinity,
			products: isOff ? [] : ["test-mode"],
			demo: true,
			testMode: !isOff,
			message: isOff 
				? "Test mode disabled" 
				: `🧪 TEST MODE: ${testTier?.toUpperCase()} tier enabled`
		};
		
		const response = NextResponse.json(testStatus);
		
		if (isOff) {
			// Clear the cookie
			response.cookies.delete("armchair-test-mode");
			console.log("🧪 Test mode DISABLED");
		} else {
			// Set the cookie for 24 hours
			response.cookies.set("armchair-test-mode", testTier!, {
				maxAge: 60 * 60 * 24,
				path: "/",
			});
			console.log(`🧪 Test mode ENABLED: ${testTier?.toUpperCase()} tier`);
		}
		
		return response;
	}
	
	// Check if test mode is already enabled via cookie
	if (isTestModeEnabled(request)) {
		const testTier = getTestModeTier(request);
		if (testTier) {
			console.log(`🧪 Running in TEST MODE: ${testTier} tier`);
			// Standard: Only unlimited spins
			// Premium: Unlimited spins + Storage + Analytics
			return NextResponse.json({
				tier: testTier,
				hasUnlimitedGenerations: true, // Both Standard & Premium
				hasStorage: testTier === "premium", // Only Premium can save
				hasAnalytics: testTier === "premium", // Only Premium
				freeSpinsRemaining: Infinity,
				products: ["test-mode"],
				demo: true,
				testMode: true,
				message: `🧪 TEST MODE: ${testTier.toUpperCase()} tier - Add ?testmode=off to disable`
			});
		}
	}

	try {
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);
		console.log("✅ User authenticated for subscription check:", userId);

		const status = await checkUserSubscription(userId, headersList);

		return NextResponse.json({ ...status, demo: false });
	} catch (error) {
		// If authentication fails (e.g., accessed directly on localhost), 
		// return demo mode data instead of error
		console.warn("⚠️ Authentication failed - returning demo mode subscription:", error);
		const demoStatus = {
			tier: "free" as SubscriptionTier,
			hasUnlimitedGenerations: false,
			hasStorage: false,
			hasAnalytics: false,
			freeSpinsRemaining: 2,
			products: [] as string[],
			demo: true,
			testMode: false,
			message: "Demo mode - Add ?testmode=premium to enable test mode"
		};
		return NextResponse.json(demoStatus);
	}
}

// POST - Decrement free spins
export async function POST(request: NextRequest) {
	try {
		const headersList = await headers();
		let userId: string | null = null;
		let isDemo = false;
		
		try {
			const result = await whopsdk.verifyUserToken(headersList);
			userId = result.userId;
			console.log("✅ User authenticated for spin decrement:", userId);
		} catch (authError) {
			console.warn("⚠️ Auth failed for spin decrement, using demo mode:", authError);
			isDemo = true;
			// In demo mode, just return success without persisting
		}

		// If in demo mode, return success without database operations
		if (isDemo || !userId) {
			console.log("📍 Demo mode: spin decrement simulated");
			return NextResponse.json({ 
				success: true, 
				demo: true,
				message: "Demo mode - spin decrement not persisted"
			});
		}

		const body = await request.json();
		const spinsUsed = body.spinsUsed || 1;

		// Get current free spins (use maybeSingle to avoid error when no row exists)
		const { data: userData, error: fetchError } = await supabaseAdmin
			.from("user_subscriptions")
			.select("free_spins_remaining")
			.eq("user_id", userId)
			.maybeSingle();

		if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
			console.error("Error fetching user subscription:", fetchError);
			return NextResponse.json(
				{ 
					error: "Database error",
					message: `Failed to fetch user subscription: ${fetchError.message}`,
					details: fetchError
				},
				{ status: 500 }
			);
		}

		if (!userData) {
			// Initialize user
			const { error: insertError } = await supabaseAdmin
				.from("user_subscriptions")
				.insert({
					user_id: userId,
					free_spins_remaining: Math.max(0, 2 - spinsUsed),
					tier: "free",
				});
			
			if (insertError) {
				console.error("Error inserting user subscription:", insertError);
				return NextResponse.json(
					{ 
						error: "Database error",
						message: `Failed to initialize user subscription: ${insertError.message}`,
						details: insertError
					},
					{ status: 500 }
				);
			}
		} else {
			// Update free spins
			const newRemaining = Math.max(0, (userData.free_spins_remaining || 0) - spinsUsed);
			const { error: updateError } = await supabaseAdmin
				.from("user_subscriptions")
				.update({ free_spins_remaining: newRemaining })
				.eq("user_id", userId);
			
			if (updateError) {
				console.error("Error updating user subscription:", updateError);
				return NextResponse.json(
					{ 
						error: "Database error",
						message: `Failed to update free spins: ${updateError.message}`,
						details: updateError
					},
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating free spins:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ 
				error: "Failed to update free spins",
				message: errorMessage
			},
			{ status: 500 }
		);
	}
}

