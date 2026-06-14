# SVU AI Studio — Waitlist (standalone)

A tiny, self-contained Next.js app that serves **only** the waitlist landing page
(From Focus Media Team · By HYDRA). It is fully isolated from the main
`svu-ai-studio` project but writes to the **same** Firestore `waitlist`
collection, so all sign-ups land in one place.

- Arabic RTL, blue/red/purple branding.
- One Firestore collection: `waitlist` (document id = lowercased email → dedupe).
- No auth, no other routes — just the form.

## Stack
Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · Firebase Firestore.

## Local development
```bash
npm install
cp .env.example .env.local        # then put the real Firebase web API key in it
npm run dev                        # http://localhost:3100
```

## Environment variables
| Name | Required | Notes |
|------|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | yes | Firebase web API key. Other Firebase config (projectId, authDomain, named databaseId, etc.) lives in `firebase-applet-config.json`. |

## Deploy to Vercel
1. Push this folder to its own Git repository.
2. In Vercel: **New Project → import the repo** (Framework preset: Next.js).
3. Add the env var `NEXT_PUBLIC_FIREBASE_API_KEY` (Production + Preview).
4. Deploy. The waitlist is served at the site root `/`.

## IMPORTANT — deploy the Firestore rules to the NAMED database
The app uses a **named** Firestore database
(`ai-studio-8738f2d4-817e-41a0-a5b7-4678cbc5fe67`), not `(default)`.
Rules must be deployed to that database or every write is denied
(`permission-denied`) and shows up as "already registered".

`firebase.json` here already targets the named database, so:
```bash
firebase deploy --only firestore:rules
```
(Or, in the Firebase Console, select the named database and publish
`firestore.rules` there.)
