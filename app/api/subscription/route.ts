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

export async function GET(request: NextRequest) {
	try {
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);

		const status = await checkUserSubscription(userId, headersList);

		return NextResponse.json(status);
	} catch (error) {
		console.error("Error fetching subscription status:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 401 }
		);
	}
}

// POST - Decrement free spins
export async function POST(request: NextRequest) {
	try {
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);

		const body = await request.json();
		const spinsUsed = body.spinsUsed || 1;

		// Get current free spins
		const { data: userData } = await supabaseAdmin
			.from("user_subscriptions")
			.select("free_spins_remaining")
			.eq("user_id", userId)
			.single();

		if (!userData) {
			// Initialize user
			await supabaseAdmin
				.from("user_subscriptions")
				.insert({
					user_id: userId,
					free_spins_remaining: Math.max(0, 2 - spinsUsed),
					tier: "free",
				});
		} else {
			// Update free spins
			const newRemaining = Math.max(0, (userData.free_spins_remaining || 0) - spinsUsed);
			await supabaseAdmin
				.from("user_subscriptions")
				.update({ free_spins_remaining: newRemaining })
				.eq("user_id", userId);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating free spins:", error);
		return NextResponse.json(
			{ error: "Failed to update free spins" },
			{ status: 500 }
		);
	}
}

