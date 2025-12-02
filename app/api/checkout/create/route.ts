import { NextRequest, NextResponse } from "next/server";

// Hardcoded Whop product URLs for Armchair Workouts
// These are the direct checkout pages on Whop
const CHECKOUT_URLS = {
	standard: "https://whop.com/tblocklabs/standard-c2/",
	premium: "https://whop.com/tblocklabs/premium-9b-a5bf/",
};

// POST - Create checkout URL for a product
export async function POST(request: NextRequest) {
	try {
		// Parse request body
		const body = await request.json();
		const { tier } = body; // Accept "standard" or "premium"

		// Validate tier
		if (tier !== "standard" && tier !== "premium") {
			return NextResponse.json(
				{ 
					error: "Invalid tier",
					message: "Tier must be 'standard' or 'premium'",
				},
				{ status: 400 }
			);
		}

		// Get the checkout URL for this tier
		const checkoutUrl = CHECKOUT_URLS[tier];
		
		console.log(`✅ Checkout URL for ${tier}:`, checkoutUrl);

		return NextResponse.json({
			checkoutUrl,
			tier,
			method: "direct_product_url",
		});
	} catch (error) {
		console.error("Error creating checkout:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{
				error: "Failed to create checkout URL",
				message: errorMessage,
				details: errorMessage,
			},
			{ status: 500 }
		);
	}
}

