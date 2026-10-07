# The 10,000 Breaths Project (Next.js)

    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

## MongoDB

Centralized responses are stored in the `breaths` collection. Set these environment variables in `.env.local`:

```
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@delhiair.khdtul1.mongodb.net/
MONGODB_DB=delhi_air
```

Replace `<db_password>` with the database user's password. Keep `MONGODB_URI` server-side; do not prefix it with `NEXT_PUBLIC_`. The database and collection are created automatically when the first response is saved.

Add the same variables to your Netlify environment settings and redeploy. The form writes through `/api/breaths`, and the map polls that route every 15 seconds.

## Structure
- `app/page.js` — all page content (server component)
- `app/globals.css` — original design + interaction styles
- `components/Effects.js` — progress bar, reveal, count-up, card tilt
- `components/BreathMap.js` — Leaflet map (browser only)
- `components/JoinForm.js` — form, Sheets submit, adds marker to map
- `public/founder.jpg` — founder photo
