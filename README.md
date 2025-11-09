# Whop Next.js App Template

A beginner-friendly template for building Whop apps with Next.js, TypeScript, and Tailwind CSS. This template includes authentication setup, webhook handling, and all the essentials to get you started quickly.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A Whop developer account ([Sign up here](https://whop.com/dashboard/developer/))

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Set Up Your Whop App

1. Go to the [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
2. Create a new app (or use an existing one)
3. In the "Hosting" section, configure these paths:
   - **Base URL**: Set to your deployment domain (e.g., `https://your-app.vercel.app`)
   - **App path**: `/experiences/[experienceId]`
   - **Dashboard path**: `/dashboard/[companyId]`
   - **Discover path**: `/discover`

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Whop credentials:
   - **WHOP_API_KEY**: Get this from `Whop Dashboard > Developer > Your App > Settings > API Keys`
   - **WHOP_WEBHOOK_SECRET**: Get this from `Whop Dashboard > Developer > Your App > Settings > Webhooks` (create a webhook first if needed)
   - **NEXT_PUBLIC_WHOP_APP_ID**: Get this from `Whop Dashboard > Developer > Your App > Settings` (format: `app_xxxxxxxxxxxxxx`)

### Step 4: Run the Development Server

```bash
pnpm dev
```

The app will start on `http://localhost:3000`

### Step 5: Connect Your App in Whop

1. Go to a Whop created in the same organization as your app
2. Navigate to the **Tools** section
3. Click **Add App** and select your app
4. In the top right of the Cursor window, find the translucent settings icon
5. Select **"localhost"** and use port **3000**

## 📁 Project Structure

```
whop/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── webhooks/      # Webhook handler for Whop events
│   ├── dashboard/         # Dashboard pages
│   ├── discover/          # Discover page
│   ├── experiences/       # Experience pages
│   └── page.tsx           # Home page
├── lib/
│   └── whop-sdk.ts        # Whop SDK configuration (already set up!)
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🔐 Authentication Setup

Authentication is already configured! The template uses the `@whop/react` package which provides the `WhopApp` component that handles authentication automatically.

**Key Files:**
- `lib/whop-sdk.ts` - SDK configuration (already set up with your env variables)
- `app/layout.tsx` - Wraps the app with `<WhopApp>` component for authentication

**How it works:**
- The `WhopApp` component automatically validates user tokens
- User information is available through Whop's React hooks
- No additional authentication code needed!

## 🎣 Webhooks

The template includes a webhook handler at `app/api/webhooks/route.ts` that:
- Validates webhook signatures from Whop
- Handles `payment.succeeded` events (you can add more!)
- Uses Vercel's `waitUntil` for async processing

To add more webhook events, edit `app/api/webhooks/route.ts` and add new event handlers.

## 🚢 Deploying to Production

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [Vercel](https://vercel.com/new)
   - Import your GitHub repository
   - Add your environment variables from `.env.local`:
     - `WHOP_API_KEY`
     - `WHOP_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_WHOP_APP_ID`
   - Deploy!

3. **Update Whop Dashboard:**
   - Go to your app settings in the Whop Dashboard
   - Update the **Base URL** to your Vercel domain
   - Update webhook callback URLs if needed

## 🐛 Troubleshooting

**App not loading properly?**
- Make sure the "App path" in your Whop developer dashboard is explicitly set to `/experiences/[experienceId]` (the placeholder text doesn't count!)
- Verify all environment variables in `.env.local` are correct
- Check that your app is added to a Whop in the same organization

**Authentication issues?**
- Verify `NEXT_PUBLIC_WHOP_APP_ID` matches your app ID in the dashboard
- Check that `WHOP_API_KEY` is correct and active
- Ensure your app paths are correctly configured in the Whop dashboard

**Webhooks not working?**
- Verify `WHOP_WEBHOOK_SECRET` matches the secret in your webhook settings
- Check that the webhook URL is correctly set in the Whop dashboard
- Ensure your deployment URL is accessible

## 📚 Next Steps

- **Explore the Whop SDK:** Check out [Whop SDK Documentation](https://dev.whop.com/sdk)
- **Learn about Apps:** Read the [Whop Apps Guide](https://dev.whop.com/apps)
- **Join the Community:** Get help in the [Whop Developer Discord](https://discord.gg/whop)

## 📖 Additional Resources

- [Whop Developer Documentation](https://dev.whop.com/introduction)
- [Whop API Reference](https://dev.whop.com/api-reference)
- [Next.js Documentation](https://nextjs.org/docs)
