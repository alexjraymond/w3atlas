# Setting up accounts (Supabase)

W3Atlas works without any backend: routes save in your browser. Accounts add saving to your
account, the **Public** toggle, Community browsing, ratings and comments. They need a free
[Supabase](https://supabase.com) project. This takes about 20 minutes, most of it creating the three
sign-in apps.

## 1. Create the project

1. Sign in at supabase.com, then **New project**. Pick a name (e.g. `w3atlas`), a database password
   (save it somewhere) and the region nearest you.
2. When it's ready, open **SQL Editor → New query**, paste the whole of
   `supabase/migrations/20261116000000_init.sql`, and click **Run**. This creates the tables and
   the security rules.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.

## 2. Connect the app

Create `.env.local` in the project folder (it stays out of git):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Restart `npm run dev`. A **Sign in** button appears in the header.

## 3. Allowed addresses

In Supabase, open **Authentication → URL Configuration**:
- **Site URL:** `http://localhost:5173` for now. Change it to your real address once the site is online.
- **Redirect URLs:** add `http://localhost:5173/**`, and later your site's address with `/**` on the end.

## 4. Sign-in providers

For each provider below, you'll paste this **callback URL** into the provider's settings. It's shown
in Supabase under **Authentication → Providers** when you open a provider:

`https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

Then copy the provider's client ID and secret back into Supabase and switch the provider on.

**Discord:** discord.com/developers/applications → **New Application** → **OAuth2**. Add the callback
URL under **Redirects** and copy the **Client ID** and **Client Secret** (Reset Secret).
Then in Supabase: **Authentication → Providers → Discord**.

**Twitch:** dev.twitch.tv/console → **Register Your Application**. Set **OAuth Redirect URLs** to the
callback URL and **Category** to *Website Integration*. Copy the **Client ID**, then **New Secret**.
Then in Supabase: **Authentication → Providers → Twitch**.

**Google:** console.cloud.google.com:
1. Create a project, then **APIs & Services → OAuth consent screen**: External, with the app name and your email.
2. **Credentials → Create credentials → OAuth client ID**, type *Web application*.
3. Add the callback URL under **Authorized redirect URIs**, and copy the **Client ID** and **Client secret**.
4. In Supabase: **Authentication → Providers → Google**.

## 5. Try it

Sign in. Routes you made before signing in show a banner: **Add to my account**. Then open a route,
turn on **Public**, and it appears under **Community**.

## Developing without Supabase

`npm run dev:mock` runs the app with a fake backend stored in the browser. Discord, Twitch and Google
each sign you in as a different test user, so you can try sharing, rating and commenting between users.

`npm run test:db` checks the database's security rules against a local Postgres
(`PGHOST`/`PGPORT`/`PGUSER` point at it).

## Icons

The app's icons come from the game's button art. With the full icon folder at `public/warcraft3_icons`
(ignored by git), run `npm run build-icons`. It copies the icons the app uses into `public/icons`
under the right names and skips Reforged versions. Then commit `public/icons`.
