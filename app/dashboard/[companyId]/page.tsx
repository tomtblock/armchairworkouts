import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { checkUserSubscription } from "@/app/api/subscription/check";
import PremiumDashboard from "@/app/components/forge/PremiumDashboard";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;
	// Ensure the user is logged in on whop.
	const headersList = await headers();
	const { userId } = await whopsdk.verifyUserToken(headersList);

	// Check subscription status
	const subscription = await checkUserSubscription(userId, headersList);

	// If user has analytics (premium), show premium dashboard
	if (subscription.hasAnalytics) {
		return (
			<div className="min-h-screen bg-black">
				<PremiumDashboard />
			</div>
		);
	}

	// Otherwise show upgrade prompt
	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-8">
			<div className="max-w-md w-full border-2 border-[#00FFFF] rounded-lg p-8 text-center">
				<h1 className="text-3xl font-bold text-[#00FFFF] mb-4">Premium Dashboard</h1>
				<p className="text-gray-300 mb-6">
					Upgrade to Premium to access your workout analytics, history, and insights.
				</p>
				<div className="space-y-2 text-left mb-6">
					<div className="text-white">✓ View all completed workouts</div>
					<div className="text-white">✓ Track cumulative totals per exercise</div>
					<div className="text-white">✓ Analytics dashboard with insights</div>
					<div className="text-white">✓ Workout history storage</div>
				</div>
				<p className="text-[#00FFFF] font-semibold text-xl mb-4">£3.99/month</p>
				<p className="text-gray-400 text-sm mb-6">
					Includes unlimited generations, storage, and analytics
				</p>
				<p className="text-gray-500 text-xs">
					Upgrade through your Whop account to access the dashboard
				</p>
			</div>
		</div>
	);
}

function JsonViewer({ data }: { data: any }) {
	return (
		<pre className="text-2 border border-gray-a4 rounded-lg p-4 bg-gray-a2 max-h-72 overflow-y-auto">
			<code className="text-gray-10">{JSON.stringify(data, null, 2)}</code>
		</pre>
	);
}
