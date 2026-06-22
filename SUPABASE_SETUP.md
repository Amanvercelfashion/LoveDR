# Supabase Integration Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Fill in:
   - **Name**: `LoveDR` (or whatever you like)
   - **Database Password**: Save this securely
   - **Region**: Choose the closest to your users
4. Click **Create new project** (takes ~1-2 minutes)

## 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Open `supabase/schema.sql` from this project and copy the entire contents
4. Paste into the SQL Editor and click **Run**
5. Verify all tables are created: `profiles`, `matches`, `video_requests`, `ratings`, `token_transactions`, `reports`

## 3. Enable Google OAuth

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Click **Google**
3. Toggle **Enable Sign in with Google**
4. You'll need Google OAuth credentials:

### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Application type: **Web application**
6. Name: `LoveDR`
7. Add Authorized redirect URIs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### Add to Supabase

1. Paste the **Client ID** and **Client Secret** into the Google provider settings
2. Add the following Authorized Redirect URIs for local development:
   ```
   http://localhost:3000/auth/v1/callback
   http://127.0.0.1:3000/auth/v1/callback
   ```

## 4. Configure Environment Variables

1. Find your Supabase project URL and anon key:
   - Go to **Project Settings** > **API**
   - Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy the **anon public** key

2. Update `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ Replace with your actual values. The anon key is safe for client-side use.

## 5. Configure Site URL (for Auth Redirects)

In Supabase dashboard, go to **Authentication** > **Settings**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**:
  ```
  http://localhost:3000/**
  http://127.0.0.1:3000/**
  ```

## 6. Run the App

```bash
npm run dev
```

The app should now load at `http://localhost:3000` and show the **Sign in with Google** button.

## 7. Test the Flow

1. Click **Sign in with Google**
2. Authorize the app with your Google account
3. After successful auth, you'll be redirected to `/orbit`
4. The app will auto-create a profile for you in the `profiles` table

## Database Structure

| Table | Purpose |
|---|---|
| `profiles` | User profiles (extended from auth.users) |
| `matches` | Match pairs between users |
| `video_requests` | Video call requests within a match |
| `ratings` | User ratings after video calls |
| `token_transactions` | Token earning/spending log |
| `reports` | User reports |

Key functions:
- `get_candidates()` — fetches eligible matches for a user
- `create_match()` — creates a match with token/daily limit logic
- `update_user_rating()` — recalculates a user's average rating
