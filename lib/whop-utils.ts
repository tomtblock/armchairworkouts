/**
 * Utility functions for Whop integration
 */

/**
 * Check if the app is running inside a Whop iframe
 */
export function isInWhopIframe(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	
	// Check if we're in an iframe
	const inIframe = window.self !== window.top;
	
	// Check if parent is whop.com
	try {
		if (inIframe && window.parent) {
			const parentUrl = window.parent.location.href;
			return parentUrl.includes("whop.com");
		}
	} catch (e) {
		// Cross-origin error means we're likely in an iframe
		// Check for Whop-specific headers or query params
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.has("whop") || document.referrer.includes("whop.com");
	}
	
	return false;
}

/**
 * Check if we have a Whop user token (client-side check)
 */
export function hasWhopUserToken(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	
	// Check for token in sessionStorage or localStorage
	// This is a basic check - actual token validation happens server-side
	return !!(
		sessionStorage.getItem("whop_user_token") ||
		localStorage.getItem("whop_user_token") ||
		document.cookie.includes("whop")
	);
}

/**
 * Determine if we should show intrusive alerts (only in Whop iframe)
 */
export function shouldShowAlerts(): boolean {
	return isInWhopIframe() || hasWhopUserToken();
}

