# The 10,000 Breaths Project (Next.js)

    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

## Google Sheets
Responses post to a Google Apps Script web app. The URL is set in `.env.local`:

    NEXT_PUBLIC_SHEET_ENDPOINT=https://script.google.com/macros/s/.../exec

On Vercel/Netlify add the same variable under Environment Variables, then redeploy.
Leave it empty to run in demo mode (nothing is saved).

## Supabase integration

To enable centralized persistence with Supabase:

1. Create a Supabase project at https://app.supabase.com.
2. Create a table `breaths` with columns: `id` (uuid, primary), `name` (text), `location` (text), `role` (text), `story` (text), `contact` (text), `lat` (float8), `lng` (float8), `text` (text), `ts` (timestamp).
3. In your project, set the following environment variables (for local dev, put in `.env.local`):

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-or-anon-key
NEXT_PUBLIC_SUPABASE=1
```

4. Deploy the app. The client will POST to `/api/breaths` which uses the server-side Supabase key to write records.

Notes:
- Use a service role key for the server if you want full insert permissions server-side. Do NOT expose service role keys to the browser.
- The server API route at `/api/breaths` reads/writes records and the frontend polls it every 15s for new records.
## Structure
- `app/page.js` — all page content (server component)
- `app/globals.css` — original design + interaction styles
- `components/Effects.js` — progress bar, reveal, count-up, card tilt
- `components/BreathMap.js` — Leaflet map (browser only)
- `components/JoinForm.js` — form, Sheets submit, adds marker to map
- `public/founder.jpg` — founder photo
