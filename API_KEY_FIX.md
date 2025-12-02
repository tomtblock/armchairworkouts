# Fix: "Invalid API key" Error

If you're seeing "▲ Invalid API key" when trying to save workouts, this means your Whop API credentials are missing or incorrect.

## Quick Fix

1. **Check your `.env.development` file** (in the project root)
   - Make sure it contains:
     ```
     WHOP_API_KEY=whop_live_xxxxxxxxxxxxxx
     NEXT_PUBLIC_WHOP_APP_ID=app_xxxxxxxxxxxxxx
     ```

2. **Get your API credentials from Whop:**
   - Go to [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
   - Select your app
   - Go to **Settings** → **API Keys**
   - Copy the **API Key** → paste into `WHOP_API_KEY`
   - In **Settings** → **General**, find **App ID** → paste into `NEXT_PUBLIC_WHOP_APP_ID`

3. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   pnpm dev
   ```

4. **Verify the fix:**
   - Try saving a workout again
   - The error should be gone

## Common Issues

### Issue: Environment variables not loading
**Solution:** Make sure:
- The file is named exactly `.env.development` (not `.env.development.txt`)
- There are no spaces around the `=` sign
- Values are not wrapped in quotes (unless the value itself contains spaces)

### Issue: Wrong API key format
**Solution:** 
- API keys should start with `whop_live_` or `whop_test_`
- App IDs should start with `app_`
- Make sure you copied the entire key (they're long strings)

### Issue: Dev server not picking up changes
**Solution:**
- Always restart the dev server after changing `.env.development`
- The dev server only reads environment variables on startup

## Still Not Working?

1. **Check the terminal** where `pnpm dev` is running
   - Look for any error messages about missing environment variables
   - Check if the server started successfully

2. **Verify your API key is valid:**
   - Go back to Whop Dashboard
   - Make sure the API key hasn't been revoked
   - Try generating a new API key if needed

3. **Check file location:**
   - `.env.development` should be in the project root (same folder as `package.json`)
   - Not in a subfolder

4. **Test the connection:**
   - Make sure you're accessing the app through Whop (not directly at localhost:3000)
   - The app needs to be connected via the Whop dev proxy

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Check the terminal output for server-side errors
3. Verify all environment variables are set correctly
4. Make sure the dev server was restarted after updating `.env.development`


