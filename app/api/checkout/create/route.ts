import { NextRequest, NextResponse } from "next/server";

// Hardcoded Whop product URLs for Armchair Workouts
// These are the direct checkout pages on Whop
const CHECKOUT_URLS: Record<"standard" | "premium", string> = {
	standard: "https://whop.com/tblocklabs/standard-c2/",
	premium: "https://whop.com/tblocklabs/premium-9b-a5bf/",
};

type CheckoutTier = keyof typeof CHECKOUT_URLS;

// POST - Create checkout URL for a product
export async function POST(request: NextRequest) {
	try {
		// Parse request body
		const body = await request.json();
		const tierInput = body.tier as string | undefined;

		// Validate tier
		if (tierInput !== "standard" && tierInput !== "premium") {
			return NextResponse.json(
				{ 
					error: "Invalid tier",
					message: "Tier must be 'standard' or 'premium'",
				},
				{ status: 400 }
			);
		}

		// TypeScript now knows tier is "standard" | "premium"
		const tier: CheckoutTier = tierInput;

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

