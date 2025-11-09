import { Whop } from "@whop/sdk";

let whopsdkInstance: Whop | null = null;

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

	// Only throw during runtime (when actually needed), not during build
	if (!apiKey) {
		throw new Error(
			"WHOP_API_KEY environment variable is missing. " +
			"This is required for Whop API operations. " +
			"Please set it in your environment variables."
		);
	}

	if (!appID) {
		throw new Error(
			"NEXT_PUBLIC_WHOP_APP_ID environment variable is missing. " +
			"This is required for Whop API operations."
		);
	}

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
