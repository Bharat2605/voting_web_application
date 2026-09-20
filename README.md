# Bharat Vote — MERN Voting Application

A full-stack voting app: Node/Express/MongoDB backend + a new React (Vite + Tailwind) frontend, fully wired together.

## Folder structure

```
VOTING_APP/
├── backend/      ← your original Express + MongoDB API (a few bugs fixed, see below)
└── frontend/     ← new React app that talks to it
```

## 1. Run the backend

```bash
cd backend
npm install
npm start
```

Runs on **http://localhost:3000** (from `.env`). Make sure MongoDB is running locally
(`mongodb://localhost:27017/Voting`, set in `db.js`).

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173**. Vite's dev server proxies `/user` and `/candidate`
requests straight to `localhost:3000`, so there's no CORS setup needed in dev.

Open **http://localhost:5173** in your browser.

## 3. Try it out

1. Go to **Register to vote**, fill in your details (name, age 18+, address, Aadhar
   number, password) → you're logged in automatically.
2. To test the admin flow: sign up a second account, then in MongoDB (Compass or
   `mongosh`) manually set that user's `role` field to `"admin"`:
   ```js
   db.users.updateOne({ aadharCardNumber: 123456789012 }, { $set: { role: "admin" } })
   ```
3. Log in as the admin → an **Admin** tab appears in the navbar → add a few candidates.
4. Log in as a regular voter → candidates appear on the **Candidates** page → select one
   and cast your vote (one vote per person, enforced by the backend).
5. Check the **Results** page — it live-refreshes every 8 seconds and shows vote share
   as a bar per candidate.
6. **Profile** page shows your details and lets you change your password.

## Bugs fixed in the backend while integrating

Your original backend logic was solid, but a few things would have silently broken the
frontend, so I fixed them directly in `backend/`:

- `GET /candidate` excluded `_id` from the response — the frontend needs each
  candidate's id to vote for them, so it's now included.
- `GET /candidate/vote/count` was declared **after** `GET /candidate/vote/:candidateID`
  in the router, so a request to `/vote/count` was being swallowed by the `:candidateID`
  route (with `candidateID = "count"`). Reordered so `/vote/count` is matched first.
- The admin-role check (`checkAdminRole`) wasn't being `await`-ed in the update/delete
  candidate routes, so it always evaluated as truthy and the check did nothing. Fixed.
- The candidate update/delete routes referenced undefined variables
  (`candidateID`/`candidateId` mismatches, a stray `new` before a static Mongoose call,
  a typo'd `reponse`) that would have thrown at runtime. Rewritten cleanly.
- `models/user.js` had `unqiue: true` (typo) on `aadharCardNumber`, so duplicate Aadhar
  numbers weren't actually blocked — fixed to `unique: true`.
- The password pre-save hook called `next()` without ever receiving `next` as a
  parameter — fixed to just `return` (Mongoose supports async hooks without `next`).

## Design notes

The frontend is a ballot-paper–inspired design: ink/paper palette, a single "ballot red"
accent, candidates listed like ballot lines, and a stamp animation on your confirmed
vote. Built with React Router (protected routes for logged-in/admin-only pages), a
small Axios wrapper that auto-attaches your JWT, and Tailwind CSS.
