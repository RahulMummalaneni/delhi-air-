# The 10,000 Breaths Project (Next.js)

    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

## Google Sheets
Responses post to a Google Apps Script web app. The URL is set in `.env.local`:

    NEXT_PUBLIC_SHEET_ENDPOINT=https://script.google.com/macros/s/.../exec

On Vercel/Netlify add the same variable under Environment Variables, then redeploy.
Leave it empty to run in demo mode (nothing is saved).

## Structure
- `app/page.js` — all page content (server component)
- `app/globals.css` — original design + interaction styles
- `components/Effects.js` — progress bar, reveal, count-up, card tilt
- `components/BreathMap.js` — Leaflet map (browser only)
- `components/JoinForm.js` — form, Sheets submit, adds marker to map
- `public/founder.jpg` — founder photo
