import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

export async function GET(request: NextRequest) {
	try {
		const headersList = await headers();
		const userToken = headersList.get("x-whop-user-token") || 
			request.headers.get("authorization")?.replace("Bearer ", "");

		if (!userToken) {
			return NextResponse.json(
				{ valid: false, error: "No user token provided" },
				{ status: 401 }
			);
		}

		// Verify user token using Whop SDK
		const { userId } = await whopsdk.verifyUserToken(headersList);

		// Get user info
		const user = await whopsdk.users.retrieve(userId);

		// Check if user has access (you can customize this logic)
		// For now, we'll just validate the token
		const valid = !!userId;

		// Check for discount codes (this would need to be implemented based on your Whop setup)
		// For now, we'll return a placeholder
		const discountApplied = false;
		const code = null;

		return NextResponse.json({
			valid,
			user: {
				id: userId,
				name: user.name || user.username,
			},
			discountApplied,
			code,
		});
	} catch (error) {
		console.error("Whop validation error:", error);
		return NextResponse.json(
			{ valid: false, error: "Validation failed" },
			{ status: 401 }
		);
	}
}

