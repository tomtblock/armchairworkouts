import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

// POST - Create checkout URL for a product
export async function POST(request: NextRequest) {
	try {
		// Verify user is authenticated with Whop
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);

		// Parse request body
		const body = await request.json();
		const { tier } = body; // Accept "standard" or "premium" instead of productId

		// Get product ID from environment based on tier
		const productId = tier === "standard" 
			? process.env.WHOP_STANDARD_PRODUCT_ID 
			: tier === "premium"
			? process.env.WHOP_PREMIUM_PRODUCT_ID
			: null;

		if (!productId) {
			return NextResponse.json(
				{ 
					error: "Product configuration missing",
					message: `Product ID for ${tier} tier is not configured. Please set WHOP_${tier.toUpperCase()}_PRODUCT_ID in your environment variables.`
				},
				{ status: 400 }
			);
		}

		// Get experience to find company information
		let companyId = "";
		let companyRoute = "";
		try {
			// Get experience from request URL or environment
			const experienceId = process.env.NEXT_PUBLIC_WHOP_EXPERIENCE_ID;
			
			if (experienceId) {
				const experience = await whopsdk.experiences.retrieve(experienceId);
				companyId = experience.company?.id || "";
				companyRoute = experience.company?.route || "";
			}
		} catch (error) {
			console.warn("Could not get company info from experience:", error);
		}

		// Try to create checkout configuration using Whop SDK
		let checkoutUrl = "";
		try {
			// List plans for the product
			const plansIterator = whopsdk.plans.list({ product_id: productId });
			
			// Get the first plan
			let planId = "";
			let planCompanyId = companyId;
			
			for await (const plan of plansIterator) {
				planId = plan.id;
				planCompanyId = (plan as any).company_id || companyId;
				break; // Just get the first plan
			}
			
			if (planId && planCompanyId) {
				// Get redirect URL
				const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || "https://whop.com";
				
				// Create checkout configuration
				const checkoutConfig = await whopsdk.checkoutConfigurations.create({
					plan_id: planId,
					company_id: planCompanyId,
					redirect_url: redirectUrl,
				});
				
				checkoutUrl = checkoutConfig.purchase_url;
			} else {
				console.warn("No plan found for product:", productId);
			}
		} catch (error) {
			console.warn("Could not create checkout configuration, using fallback URL:", error);
			console.error("Checkout error details:", error);
		}

		// Fallback: Construct Whop checkout URL directly
		// Format: https://whop.com/{companyRoute}/checkout?product={productId} or https://whop.com/checkout/{productId}
		if (!checkoutUrl) {
			const baseUrl = "https://whop.com";
			// Try to construct a proper checkout URL
			if (companyRoute) {
				checkoutUrl = `${baseUrl}/${companyRoute}/checkout?product=${productId}`;
			} else {
				// Use the product's direct checkout page
				// Whop products can be accessed via /checkout/{productId} or /{productId}
				checkoutUrl = `${baseUrl}/checkout/${productId}`;
			}
		}
		
		// Validate we have a URL
		if (!checkoutUrl || checkoutUrl.trim() === "") {
			console.error("Failed to generate checkout URL", { productId, companyRoute, companyId });
			return NextResponse.json(
				{ 
					error: "Failed to create checkout URL",
					message: "Could not generate checkout URL. Please verify your product IDs are correct.",
					details: `Product ID: ${productId}, Company Route: ${companyRoute || "not found"}`
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({
			checkoutUrl,
			productId,
			tier,
		});
	} catch (error) {
		console.error("Error creating checkout:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{
				error: "Failed to create checkout URL",
				details: errorMessage,
			},
			{ status: 500 }
		);
	}
}

