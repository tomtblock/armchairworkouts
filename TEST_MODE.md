# Test Mode Guide

## Enabling Test Mode

To test all features without payment rails, enable test mode by adding this to your environment variables:

### Local Development (.env.development or .env.local)

```bash
ENABLE_TEST_MODE=true
```

### Netlify (Environment Variables)

1. Go to Netlify Dashboard → Your Site → Site settings
2. Build & deploy → Environment → Environment variables
3. Add new variable:
   - **Key**: `ENABLE_TEST_MODE`
   - **Value**: `true`
4. Redeploy your site

## What Test Mode Does

When `ENABLE_TEST_MODE=true` is set, the app will:

✅ **Grant Premium tier access** to all users
✅ **Unlimited workout generations** (no free spin limits)
✅ **Full storage access** - workouts are saved to Supabase
✅ **Analytics dashboard access** - can view workout history
✅ **All Premium features unlocked**

## Important Notes

⚠️ **Test mode should only be used during development/testing**
- Remove or set to `false` before going to production
- Test mode bypasses all subscription checks
- All users will appear as Premium subscribers

## Disabling Test Mode

To disable test mode:
1. Remove `ENABLE_TEST_MODE=true` from your environment variables, OR
2. Set `ENABLE_TEST_MODE=false`

After disabling, the app will return to normal subscription-based access control.

