import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { checkUserSubscription } from "@/app/api/subscription/check";
import WorkoutHistoryDashboard from "@/app/components/forge/WorkoutHistoryDashboard";
import UpgradeModal from "@/app/components/forge/UpgradeModal";

export default async function DashboardPage() {
	// Ensure the user is logged in on whop.
	const headersList = await headers();
	const { userId } = await whopsdk.verifyUserToken(headersList);

	// Check subscription status
	const subscription = await checkUserSubscription(userId, headersList);

	// Only Premium users can access the dashboard (hasAnalytics = Premium)
	if (!subscription.hasAnalytics) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center p-8" style={{
				background: "#000000",
			}}>
				<div className="max-w-md w-full border-2 border-[#00FFFF] rounded-lg p-8 text-center" style={{
					boxShadow: "0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)",
				}}>
					{/* Terminal Corner Brackets */}
					<div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />
					<div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#00FFFF]" style={{
						boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
					}} />

					<h1 className="text-3xl font-bold mb-4" style={{
						fontFamily: "'Orbitron', sans-serif",
						color: "#00FFFF",
						textShadow: "0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)",
					}}>
						PREMIUM DASHBOARD
					</h1>
					<p className="text-gray-300 mb-6" style={{
						fontFamily: "'Courier New', monospace",
					}}>
						&gt; UPGRADE TO PREMIUM TO ACCESS WORKOUT HISTORY
					</p>
					<div className="space-y-2 text-left mb-6">
						<div className="text-white flex items-center gap-2">
							<span className="text-[#00FF00]">✓</span>
							<span>View all completed workouts with dates</span>
						</div>
						<div className="text-white flex items-center gap-2">
							<span className="text-[#00FF00]">✓</span>
							<span>Track cumulative totals per exercise</span>
						</div>
						<div className="text-white flex items-center gap-2">
							<span className="text-[#00FF00]">✓</span>
							<span>Analytics dashboard with insights</span>
						</div>
						<div className="text-white flex items-center gap-2">
							<span className="text-[#00FF00]">✓</span>
							<span>Workout history storage</span>
						</div>
					</div>
					<div className="p-4 border border-[#00FFFF] rounded mb-4" style={{
						background: "rgba(0, 255, 255, 0.1)",
					}}>
						<p className="text-[#00FFFF] font-semibold text-xl mb-2" style={{
							fontFamily: "'Orbitron', sans-serif",
						}}>
							£3.99/month
						</p>
						<p className="text-gray-400 text-sm">
							Includes unlimited generations, storage, and analytics
						</p>
					</div>
					<p className="text-gray-500 text-xs" style={{
						fontFamily: "'Courier New', monospace",
					}}>
						&gt; UPGRADE THROUGH YOUR WHOP ACCOUNT
					</p>
				</div>
			</div>
		);
	}

	// Premium users get the full dashboard
	return <WorkoutHistoryDashboard />;
}

function JsonViewer({ data }: { data: any }) {
	return (
		<pre className="text-2 border border-gray-a4 rounded-lg p-4 bg-gray-a2 max-h-72 overflow-y-auto">
			<code className="text-gray-10">{JSON.stringify(data, null, 2)}</code>
		</pre>
	);
}
