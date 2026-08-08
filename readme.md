# Match Tracker

A mobile-first, sideline substitution and playing-time tracker for a volunteer football
(soccer) coach. Pure client-side app — no backend, no database, no accounts, nothing sent
anywhere. The only persistence is `localStorage`, used solely to survive a phone screen
lock, an accidental tab switch, or a refresh mid-match; it's wiped completely when the
coach taps **End Match**.

## Stack

- React + Vite (client-side only)
- Plain CSS, mobile-first, high-contrast for outdoor daylight use
- A tiny Express server (`server.js`) that just serves the built static files — no API
  routes, no server-side logic
- Optional PWA basics (manifest + service worker) for offline use once loaded

## How the timers work

Match time, half time, and every player's stint are all computed from `Date.now()`
timestamp diffs (`accumulatedMs` + `startedAt`), never from counting `setInterval` ticks.
That means the clocks stay accurate even if the tab is backgrounded, the phone screen
locks, or the browser throttles timers — a re-render just picks up wherever the real
elapsed time actually is.

## Local development

```bash
npm install
npm run dev
```

Opens a dev server (default `http://localhost:5173`) with hot reload.

## Production build

```bash
npm run build   # outputs static files to dist/
npm start        # serves dist/ via server.js (respects $PORT, defaults to 3000)
```

## Deploying to Railway

1. Push this project to a GitHub repo (or use the Railway CLI to deploy the local
   directory directly).
2. In Railway, create a new project and select **Deploy from GitHub repo** (or run
   `railway up` from this directory with the Railway CLI).
3. Railway auto-detects Node from `package.json`. It will run:
   - Build: `npm install && npm run build` (Railway runs `npm run build` automatically if
     a `build` script exists — if it doesn't trigger automatically, set the build command
     explicitly in the service settings to `npm run build`)
   - Start: `npm start` (runs `node server.js`, which serves the `dist/` folder)
4. Railway injects `PORT` automatically — `server.js` already reads `process.env.PORT`, so
   no extra configuration is needed.
5. Once deployed, open the generated `*.up.railway.app` URL on a phone, and optionally
   "Add to Home Screen" for a standalone, full-screen PWA experience.

No environment variables, databases, or secrets are required — this is a fully static app
behind a one-file static file server.

## Using it on match day

1. **Setup**: set the number of field slots, half length, and (optionally) a substitution
   reminder interval, then enter shirt numbers for the starting lineup and bench.
2. **Match clock**: tap Start, and Pause/Resume for stoppages (injuries, etc.). When the
   half length is reached you'll get a beep + vibration + a visual "TIME UP" flag — the
   clock keeps counting so you can see how deep into stoppage time you are.
3. **Subs**: tap **Sub Off** on an on-field player, then pick who comes on from the bench
   list (sorted so the least-played player is at the top). **Bring On** lets you fill an
   open slot directly from the bench (e.g. after an injury) without pairing it to a
   sub-off.
4. **Injuries**: tap **Injured** from either list to stop a player's clock and flag them;
   **Un-injure** returns them to the bench (bring them back on when there's a free slot).
5. **Half time**: tap **Half Time** to get a countdown break timer of the same length as a
   half; **Start 2nd Half** resumes the match clock and keeps every player's cumulative
   total exactly where it left off.
6. **End Match**: confirms, then wipes all match data from the device and returns to
   Setup.

If the page is reloaded (or the phone was locked and re-opened) while a match is in
progress, you'll be asked whether to **Resume match in progress** or **Start fresh**.
