# Supabase → Firebase Migration Plan

## Context

The city-tracker app currently uses Supabase for two things: a single `entries` Postgres table and a `photos` storage bucket. The free tier has a hard quota and a project-pause-after-inactivity policy, and we're starting to incur cost. We want to move to **Firebase (Firestore + Firebase Storage)**, which has a friendlier always-on free tier for this workload.

Scope of what's actually in use today (verified by grep):
- One table `entries` (~25 flat columns, bilingual structured address, GPS, `photo_urls TEXT[]`, `created_at`)
- One public bucket `photos` (no deletes anywhere in the code)
- **No Supabase Auth, Realtime, RPC, or Edge Functions**
- 6 distinct query patterns across 6 files

Outcome we want:
1. Identical app behavior, no UX change.
2. All ~100 existing entries + their photos copied over so we don't lose history.
3. Firestore + Storage replace Supabase Postgres + Storage cleanly. We delete the `supabase/` folder and the SDK afterward.
4. The new code path is post-March-2024 Firestore (multi-field range filters), so the bounding-box geo query ports verbatim — no geohash dependency.

## Workflow

**Step-by-step with explicit checkpoints.** Before moving from one numbered step in the Sequencing section to the next, I'll stop and ask the user to confirm. This is to let the user stay engaged with each phase (especially the Firebase console steps where they're doing the clicking) and catch any course-correction early. No "auto-pilot through the whole plan" runs.

## Approach

A 1:1 swap. Keep the `Entry` TypeScript shape unchanged, store flat fields in Firestore docs (no nesting), preserve `created_at` as an ISO string for read-side compatibility with `csvExport.ts` and i18n date formatting. Replace the Supabase client module with a Firebase equivalent that exposes the **same exported function names** (`createEntry`, `uploadPhoto`) and an analogous `db` handle, so consumer files change minimally.

### New files
- **`src/lib/firebase.ts`** — replaces `src/lib/supabase.ts`. Exports:
  - `db` (Firestore handle)
  - `storage` (Firebase Storage handle)
  - `uploadPhoto(file: File): Promise<string | null>` — same signature; uses `ref(storage, path)` + `uploadBytes` + `getDownloadURL`. Same filename convention (`{utcDate}-{rand}.{ext}`).
  - `createEntry(entry: CreateEntryData): Promise<Entry>` — same signature; calls `addDoc(collection(db,'entries'), flattenedDoc)` and returns the inserted doc with `id` and `created_at` (ISO string from `serverTimestamp` resolved by re-fetching, or set client-side via `new Date().toISOString()`). Recommended: set `created_at: new Date().toISOString()` client-side for simplicity — matches current Supabase default behavior closely enough.

### Files to touch (drop-in import swap)
Replace `from '@/lib/supabase'` with `from '@/lib/firebase'` and adapt the query call:
- `src/App.tsx:11,38` — count by type. Becomes: `getDocs(query(collection(db,'entries'), ...))` then count client-side (only ~100 docs; no aggregation query needed).
- `src/screens/EntriesListScreen.tsx:10,56` — list all, order by `created_at` desc. Becomes: `getDocs(query(collection(db,'entries'), orderBy('created_at','desc')))`.
- `src/screens/AddEntryScreen.tsx:13` — `createEntry` import only; no query rewrite.
- `src/hooks/useNearbyEntries.ts:2,61` — bbox spatial query. Becomes:
  ```ts
  query(collection(db,'entries'),
    where('type','==',entryType),
    where('latitude','>=',bbox.minLat), where('latitude','<=',bbox.maxLat),
    where('longitude','>=',bbox.minLon), where('longitude','<=',bbox.maxLon),
  )
  ```
- `src/hooks/usePhotoUpload.ts:2` — `uploadPhoto` import only.
- `src/lib/csvExport.ts:1,18,42` — date dropdown query + export query. Becomes:
  - Dropdown: `getDocs(query(collection(db,'entries'), orderBy('created_at','desc')))` selecting all (or use `select()` from Firestore SDK if available — but with ~100 entries, full read is fine).
  - Export with optional date filter: `query(..., where('created_at','>=',startISO), where('created_at','<=',endISO), orderBy('created_at','desc'))`.

### Files to delete
- `src/lib/supabase.ts`
- `supabase/` directory (migrations + config.toml)
- Supabase scripts in `package.json` (`supabase:start`, `:stop`, `:status`, `:link`, `:push`, `:reset`)
- Dependencies: `@supabase/supabase-js`, `supabase`

### Env / config
- New `.env.local` keys (Firebase web app config):
  ```
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  VITE_FIREBASE_STORAGE_BUCKET=...
  VITE_FIREBASE_APP_ID=...
  ```
  (Remove `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.)
- `vercel.json` unchanged (SPA rewrite rule).
- Vercel project: update env vars in dashboard after migration is verified locally.

### Firestore data shape
- Collection: `entries` (auto-IDs).
- Fields: exactly the columns from the migration SQL, kept flat. The `Entry` TS interface in `src/types/index.ts` already matches this shape — no type changes needed.
- `created_at`: store as ISO string (matches current `Entry.created_at: string` typing and `new Date(entry.created_at)` consumer usage in `csvExport.ts`).
- `photo_urls`: array of strings, same as today, but now Firebase Storage download URLs instead of Supabase public URLs.

### Indexes
Firestore auto-prompts for composites with a one-click link on the first failed query. Expected indexes:
- `created_at` (desc) — singleton, auto-generated.
- Composite `(type ASC, latitude ASC, longitude ASC)` — needed by `useNearbyEntries`. Most-selective-first ordering per Firebase best practice.
- Composite `(created_at)` is single-field, automatic.

No manual `firestore.indexes.json` needed initially — let the console-prompted flow create them. We can capture them later if we want infra-as-code.

### Storage rules / Firestore rules
For parity with current "wide open" Supabase RLS:

```
// firestore.rules
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{doc} { allow read, write: if true; }
  }
}

// storage.rules
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{file} { allow read, write: if true; }
  }
}
```

Flagging: this preserves today's posture (anyone-can-write). Worth tightening later — out of scope for this migration.

### Data migration script
**`scripts/migrate-supabase-to-firebase.ts`** — one-off Node script, run locally once.

Flow:
1. Read all rows from Supabase `entries` table using the existing service-role (or anon) key.
2. For each row:
   - For each URL in `photo_urls`: `fetch()` the photo bytes from the Supabase public URL → upload to Firebase Storage at the **same filename** → collect new download URL.
   - Build the Firestore doc with all flat fields and the rewritten `photo_urls`. Preserve original `created_at` (parse the Supabase timestamp, write as ISO string).
   - `addDoc()` into the `entries` collection (or `setDoc(doc(db,'entries',originalId))` if we want to keep IDs — recommended: keep IDs for traceability).
3. Print a summary: N entries copied, M photos copied, errors.

Uses **firebase-admin** SDK for server-side writes (bypasses security rules). Auth via a service account JSON downloaded from the Firebase console.

Idempotency: re-running should overwrite existing docs (use `setDoc` not `addDoc`) and skip already-uploaded photos by filename (check `getMetadata` first, or just overwrite — at 100 records the cost is negligible).

Actual scale: **44 records, ~50 photos total**. Sequential execution, expected runtime <30s. No batching, no concurrency, no resumability needed.

### Sequencing
0. **Back up Supabase data locally before anything else.** Two options, do both for safety:
   - **Database**: Supabase Dashboard → Database → Backups → Download manual backup (or Table Editor → entries → Export → CSV). Save under `backups/supabase-YYYY-MM-DD/entries.csv` (or `.sql`).
   - **Photos**: Supabase Dashboard → Storage → photos bucket → select all → Download as zip. Save under `backups/supabase-YYYY-MM-DD/photos/`.
   - Alternative I can script: a tiny readonly Node script `scripts/backup-supabase.ts` that dumps `entries` to JSON and downloads every photo to disk. Recommended over manual clicking — gives a clean, restorable snapshot. Add `backups/` to `.gitignore` (not committed).
   - **Do not touch Supabase or delete anything until the backup is verified by `ls`-ing the files.**
1. **Firebase project setup** (user action, I'll guide step-by-step):
   - Create new project at https://console.firebase.google.com
   - Enable **Cloud Firestore** in **Native mode**, pick a region (recommend `europe-west3` for Israel proximity, or `us-central1` for cheapest egress)
   - Enable **Cloud Storage** (uses the same region)
   - Add a Web App → copy the config object → paste into `.env.local`
   - Project Settings → Service accounts → Generate new private key → save JSON locally for the migration script (gitignored)
2. Add Firebase SDK deps (`firebase`, `firebase-admin` for the migration script).
3. Write `src/lib/firebase.ts` mirroring the supabase module's exports.
4. Port the 6 consumer files (mechanical, one PR-sized change).
5. Apply permissive Firestore + Storage rules (matches today's Supabase posture).
6. Run dev server, manually add a fresh entry, verify list/map/nearby/CSV all work against empty Firestore. Firebase will prompt for the composite index on first nearby query — click the link to auto-create.
7. Run the data-migration script against the live Supabase data (44 records, ~50 photos → sequential run, expected <30s total).
8. Verify list view shows all 44 migrated entries, all photos render.
9. Deploy to Vercel with updated env vars.
10. Delete `supabase/`, `src/lib/supabase.ts`, and supabase deps + scripts from `package.json`.
11. (Optional, after grace period) decommission the Supabase project.

## Verification

End-to-end smoke test against the migrated app, run locally (`yarn dev`):
1. **Add entry path** — `AddEntryScreen`: pick type, GPS auto-fills, add 2 photos, save → entry appears in Firestore console + photo files appear in Storage console + back-navigation lands on home with snackbar success.
2. **List view** — `EntriesListScreen`: shows new entry + all migrated entries, newest first, correct count badge.
3. **Map view** — `EntriesMapView` via toggle: all migrated entries plotted at correct lat/lon.
4. **Nearby / duplicate detection** — Re-open `AddEntryScreen` near an existing entry of the same type. `DuplicateLocationModal` should pop up, listing the nearby entry within 50m. This exercises the composite index (`type` + `latitude` + `longitude` ranges).
5. **CSV export** — `ExportModal`: date dropdown lists all dates with entries; selecting one filters correctly; "All dates" exports everything; downloaded CSV opens in Excel with Hebrew rendering correct.
6. **Photo display** — `PhotoCarousel` in `EntryPreviewModal`: all old photos render from new Firebase Storage URLs.

If 1–6 pass, the migration is done.

## Confirmed scope
- **44 entries, ~50 photos** to migrate (confirmed by user).
- **No existing Firebase project** — creation is step 1 of the sequencing.
