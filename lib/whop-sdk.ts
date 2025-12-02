import { Whop } from "@whop/sdk";

let whopsdkInstance: Whop | null = null;

/**
 * Check if we're in a build/prerender context where SDK isn't needed
 */
function isBuildTime(): boolean {
	// During Next.js static generation, we don't need the SDK
	return typeof window === "undefined" && 
		(process.env.NODE_ENV === "production" || 
		 process.env.NEXT_PHASE === "phase-production-build");
}

/**
 * Get or create the Whop SDK client instance.
 * Uses lazy initialization to prevent build-time errors when env vars are missing.
 */
function getWhopSDK(): Whop {
	if (whopsdkInstance) {
		return whopsdkInstance;
	}

	const apiKey = process.env.WHOP_API_KEY;
	const appID = process.env.NEXT_PUBLIC_WHOP_APP_ID;
	const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

	// During build time, return a dummy SDK that won't actually be used
	if (isBuildTime() && (!apiKey || !appID)) {
		console.warn("⚠️ Whop SDK: Using placeholder during build (env vars not fully available)");
		// Return a minimal Whop instance that satisfies types but won't be called
		whopsdkInstance = new Whop({
			appID: appID || "app_placeholder",
			apiKey: apiKey || "placeholder_key",
		});
		return whopsdkInstance;
	}

	// Only throw during runtime (when actually needed), not during build
	if (!apiKey) {
		console.error("❌ WHOP_API_KEY is missing from environment variables");
		throw new Error(
			"WHOP_API_KEY environment variable is missing. " +
			"This is required for Whop API operations. " +
			"Please set it in your .env.development file and restart the dev server."
		);
	}

	if (!appID) {
		console.error("❌ NEXT_PUBLIC_WHOP_APP_ID is missing from environment variables");
		throw new Error(
			"NEXT_PUBLIC_WHOP_APP_ID environment variable is missing. " +
			"This is required for Whop API operations. " +
			"Please set it in your .env.development file and restart the dev server."
		);
	}

	// Validate API key format (allow both old and new formats)
	// Newer Whop API keys may start with 'apik_' or other formats
	const isValidFormat = apiKey.startsWith("whop_live_") || 
	                     apiKey.startsWith("whop_test_") || 
	                     apiKey.startsWith("apik_");
	
	if (!isValidFormat) {
		console.warn("⚠️ WHOP_API_KEY format may be invalid. Expected formats: 'whop_live_', 'whop_test_', or 'apik_'");
		console.warn(`   Current value starts with: ${apiKey.substring(0, 10)}...`);
		// Don't throw - let the Whop SDK validate the key itself
	}

	// Validate App ID format
	if (!appID.startsWith("app_")) {
		console.error("❌ NEXT_PUBLIC_WHOP_APP_ID format is invalid. Should start with 'app_'");
		console.error(`   Current value starts with: ${appID.substring(0, 10)}...`);
		throw new Error(
			"Invalid NEXT_PUBLIC_WHOP_APP_ID format. " +
			"App IDs should start with 'app_'. " +
			"Please check your .env.development file and get a valid App ID from Whop Dashboard."
		);
	}

	console.log("✅ Whop SDK initializing with API key...");
	whopsdkInstance = new Whop({
		appID,
		apiKey,
		webhookKey: webhookSecret ? btoa(webhookSecret) : "",
	});

	return whopsdkInstance;
}

/**
 * Exported Whop SDK client.
 * Access via whopsdk.verifyUserToken(), whopsdk.users.retrieve(), etc.
 * 
 * Note: This will throw an error if WHOP_API_KEY is not set when first accessed.
 * This prevents build-time crashes while still ensuring runtime safety.
 */
export const whopsdk = new Proxy({} as Whop, {
	get(_target, prop) {
		const client = getWhopSDK();
		const value = (client as any)[prop];
		// If it's a function, bind it to the client instance
		if (typeof value === "function") {
			return value.bind(client);
		}
		return value;
	},
});
