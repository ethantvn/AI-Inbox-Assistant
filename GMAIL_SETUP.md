# Gmail API Integration Setup Guide

This guide walks you through setting up Gmail API integration for the Inbox Ops Assistant.

## Prerequisites

- Google Cloud Console account
- Existing NextAuth Google OAuth setup (already configured)

## Step 1: Enable Gmail API in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Library**
4. Search for **"Gmail API"**
5. Click on **Gmail API** and click **Enable**

## Step 2: Configure OAuth Scopes

The Gmail API requires specific OAuth scopes. These are already configured in `app/api/auth/[...nextauth]/route.ts`:

```typescript
authorization: {
  params: {
    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
  },
}
```

**Scope Explanation:**
- `openid email profile` - Basic user info (already used)
- `https://www.googleapis.com/auth/gmail.readonly` - Read-only access to Gmail messages

**For sending emails later**, you'll need to add:
- `https://www.googleapis.com/auth/gmail.send`

## Step 3: Update OAuth Consent Screen (if needed)

1. Go to **APIs & Services** → **OAuth consent screen**
2. Make sure your app is configured with:
   - **User Type**: External (or Internal if using Google Workspace)
   - **Scopes**: Should include `.../auth/gmail.readonly`
3. Add test users if your app is in testing mode

## Step 4: Configure Environment Variables

Add to your `.env.local`:

```env
# Email Provider Selection (server-side)
# Set to "gmail" to use Gmail API, "mock" (or leave unset) for mock data
EMAIL_PROVIDER=gmail

# Email Provider Selection (client-side - must use NEXT_PUBLIC_ prefix)
# This is used by the dashboard to determine which API route to call
NEXT_PUBLIC_EMAIL_PROVIDER=gmail
```

**Important:** Both variables should be set to the same value. The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js.

## Step 5: Re-authenticate Users

**Important:** Users who signed in before adding Gmail scopes need to sign out and sign in again to grant Gmail permissions.

The new OAuth flow will request Gmail read access, and the access token will be stored in the session.

## Step 6: Test the Integration

1. Set `EMAIL_PROVIDER=gmail` in `.env.local`
2. Restart your dev server
3. Sign out and sign in again
4. Navigate to `/dashboard` - you should see your real Gmail emails

## Troubleshooting

### "Gmail access token not found"
- Sign out and sign in again to refresh the OAuth token with Gmail scopes
- Check that the token is being stored in the session (see `app/api/auth/[...nextauth]/route.ts`)

### "Gmail API error: 401"
- Token may have expired - implement token refresh logic
- Check that Gmail API is enabled in Google Cloud Console
- Verify OAuth scopes include `gmail.readonly`

### "Gmail API error: 403"
- Check that Gmail API is enabled for your project
- Verify OAuth consent screen is properly configured
- Ensure test users are added if app is in testing mode

## Token Refresh (TODO)

Currently, tokens will expire after ~1 hour. To handle this:

1. Implement token refresh in `app/api/auth/[...nextauth]/route.ts` JWT callback
2. Use the `refresh_token` to get a new `access_token` when expired
3. Store refreshed tokens back in the session/database

Example refresh logic:
```typescript
if (token.expiresAt && Date.now() >= token.expiresAt * 1000) {
  // Refresh token using refresh_token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: token.refreshToken!,
      grant_type: 'refresh_token',
    }),
  });
  const refreshed = await response.json();
  token.accessToken = refreshed.access_token;
  token.expiresAt = Math.floor(Date.now() / 1000) + refreshed.expires_in;
}
```

## Next Steps

- [ ] Implement token refresh logic
- [ ] Add error handling for expired tokens
- [ ] Implement `sendReply()` method for sending emails
- [ ] Add pagination for fetching more than 20 emails
- [ ] Add email filtering/search capabilities

