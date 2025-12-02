"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// Dynamically import WhopApp only on the client side
// This prevents build-time SDK initialization errors when env vars aren't available
const WhopAppDynamic = dynamic(
	() => import("@whop/react/components").then(mod => mod.WhopApp),
	{ 
		ssr: false,
	}
);

/**
 * Wrapper for WhopApp component.
 * Uses dynamic import to prevent build-time SDK initialization errors.
 * The WhopApp component only loads on the client side.
 */
export function WhopAppWrapper({ children }: { children: ReactNode }) {
	// Check if app ID is available at build/runtime
	const hasAppId = !!process.env.NEXT_PUBLIC_WHOP_APP_ID;
	
	if (!hasAppId) {
		// No app ID - render children directly
		return <>{children}</>;
	}

	// Render with dynamically loaded WhopApp
	// Children are passed through whether or not WhopApp has loaded
	return <WhopAppDynamic>{children}</WhopAppDynamic>;
}

