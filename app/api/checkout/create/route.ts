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
		const { productId } = body;

		if (!productId) {
			return NextResponse.json(
				{ error: "Product ID is required" },
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
			const firstPlan = await plansIterator.next();
			
			if (firstPlan && !firstPlan.done && firstPlan.value) {
				const plan = firstPlan.value;
				
				// Get redirect URL
				const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 
				                    process.env.NEXT_PUBLIC_VERCEL_URL 
				                    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
				                    : "https://whop.com";
				
				// Create checkout configuration
				const checkoutConfig = await whopsdk.checkoutConfigurations.create({
					plan_id: plan.id,
					company_id: companyId || (plan as any).company_id || "",
					redirect_url: redirectUrl,
				});
				
				checkoutUrl = checkoutConfig.purchase_url;
			}
		} catch (error) {
			console.warn("Could not create checkout configuration, using fallback URL:", error);
		}

		// Fallback: Construct Whop checkout URL directly
		// Format: https://whop.com/checkout/{productId} or https://whop.com/{companyRoute}/checkout?product={productId}
		if (!checkoutUrl) {
			const baseUrl = "https://whop.com";
			if (companyRoute) {
				checkoutUrl = `${baseUrl}/${companyRoute}/checkout?product=${productId}`;
			} else {
				// Try direct product checkout URL
				checkoutUrl = `${baseUrl}/checkout/${productId}`;
			}
		}

		return NextResponse.json({
			checkoutUrl,
			productId,
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

