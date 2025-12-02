"use client";

import { WhopApp } from "@whop/react/components";
import { useEffect, useState } from "react";

/**
 * Client-side wrapper for WhopApp to prevent build-time SDK initialization errors.
 * The WhopApp component requires NEXT_PUBLIC_WHOP_APP_ID which may not be
 * available during static page generation (e.g., /_not-found).
 */
export function WhopAppWrapper({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// During SSR/build, just render children without WhopApp wrapper
	// This prevents the SDK from trying to initialize during build
	if (!mounted) {
		return <>{children}</>;
	}

	return <WhopApp>{children}</WhopApp>;
}

