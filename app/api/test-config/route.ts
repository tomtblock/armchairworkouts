import { NextRequest, NextResponse } from "next/server";

// GET - Test endpoint to check environment variables (for debugging)
export async function GET(request: NextRequest) {
	// Only allow in development
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json({ error: "Not available in production" }, { status: 403 });
	}

	const apiKey = process.env.WHOP_API_KEY;
	const appID = process.env.NEXT_PUBLIC_WHOP_APP_ID;
	const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

	return NextResponse.json({
		hasApiKey: !!apiKey,
		apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "missing",
		apiKeyLength: apiKey?.length || 0,
		hasAppID: !!appID,
		appIDPrefix: appID ? appID.substring(0, 10) + "..." : "missing",
		appIDLength: appID?.length || 0,
		hasWebhookSecret: !!webhookSecret,
		expectedApiKeyFormat: "Should start with 'whop_live_' or 'whop_test_'",
		expectedAppIDFormat: "Should start with 'app_'",
		status: apiKey && appID ? "✅ Configuration looks good" : "❌ Missing required variables",
	});
}


