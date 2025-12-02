import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import WorkoutForgeApp from "@/app/components/forge/WorkoutForgeApp";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	
	// Try to verify user token, but allow the app to work in demo mode if accessed directly
	try {
		await whopsdk.verifyUserToken(await headers());
	} catch (error) {
		// If authentication fails (e.g., accessed directly on localhost), 
		// still render the app - it will work in demo mode
		console.warn("⚠️ Authentication failed - app will run in demo mode:", error);
	}

	// You can optionally fetch and use Whop data here if needed
	// const [experience, user, access] = await Promise.all([
	// 	whopsdk.experiences.retrieve(experienceId),
	// 	whopsdk.users.retrieve(userId),
	// 	whopsdk.users.checkAccess(experienceId, { id: userId }),
	// ]);

	return <WorkoutForgeApp />;
}
