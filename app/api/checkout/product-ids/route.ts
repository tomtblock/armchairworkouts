import { NextRequest, NextResponse } from "next/server";

// GET - Return product IDs for client-side use
export async function GET(request: NextRequest) {
	try {
		return NextResponse.json({
			standardProductId: process.env.WHOP_STANDARD_PRODUCT_ID || "",
			premiumProductId: process.env.WHOP_PREMIUM_PRODUCT_ID || "",
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to get product IDs" },
			{ status: 500 }
		);
	}
}

