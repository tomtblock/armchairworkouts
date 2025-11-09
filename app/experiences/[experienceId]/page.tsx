import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import WorkoutForgeApp from "@/app/components/forge/WorkoutForgeApp";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	// Ensure the user is logged in on whop.
	await whopsdk.verifyUserToken(await headers());

	// You can optionally fetch and use Whop data here if needed
	// const [experience, user, access] = await Promise.all([
	// 	whopsdk.experiences.retrieve(experienceId),
	// 	whopsdk.users.retrieve(userId),
	// 	whopsdk.users.checkAccess(experienceId, { id: userId }),
	// ]);

	return <WorkoutForgeApp />;
}
