/**
 * One-off migration: copy entries + photos from Supabase to Firebase.
 *
 * Run: yarn migrate:firebase
 * Reads VITE_SUPABASE_*, FIREBASE_SERVICE_ACCOUNT_PATH from .env.local
 *
 * Behavior:
 *   - Preserves original Supabase entry IDs (uses setDoc, not addDoc)
 *   - Preserves original created_at timestamps
 *   - Re-uploads each photo with the same filename to Firebase Storage
 *   - Rewrites photo_urls in Firestore to point at new Firebase download URLs
 *   - Idempotent: re-running overwrites Firestore docs and re-uploads photos
 */
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!SUPABASE_URL || !SUPABASE_KEY || !SERVICE_ACCOUNT_PATH) {
  console.error('Missing env vars. Need VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, FIREBASE_SERVICE_ACCOUNT_PATH.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(SERVICE_ACCOUNT_PATH), 'utf8')) as ServiceAccount;
const projectId = (serviceAccount as { project_id: string }).project_id;
const bucketName = `${projectId}.firebasestorage.app`;

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: bucketName,
});
const db = getFirestore();
const bucket = getStorage().bucket();

interface SupabaseEntry {
  id: string;
  type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  address_he: string | null;
  house_number_en: string | null;
  street_en: string | null;
  neighborhood_en: string | null;
  city_en: string | null;
  county_en: string | null;
  state_en: string | null;
  postcode_en: string | null;
  country_en: string | null;
  country_code: string | null;
  house_number_he: string | null;
  street_he: string | null;
  neighborhood_he: string | null;
  city_he: string | null;
  county_he: string | null;
  state_he: string | null;
  postcode_he: string | null;
  country_he: string | null;
  photo_urls: string[];
  created_at: string;
}

/**
 * Re-upload a photo from a Supabase public URL to Firebase Storage,
 * preserving the original filename. Returns the Firebase download URL.
 */
async function copyPhoto(supabaseUrl: string): Promise<string> {
  const filename = supabaseUrl.split('/').pop();
  if (!filename) throw new Error(`Could not derive filename from ${supabaseUrl}`);

  const res = await fetch(supabaseUrl);
  if (!res.ok) throw new Error(`Fetch ${supabaseUrl}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const storagePath = `photos/${filename}`;
  const file = bucket.file(storagePath);

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream';

  // Save with a download token so getDownloadURL-style URLs work.
  // Generate a UUID-style token and store it in metadata so Firebase Storage
  // serves the file via the tokenized public URL.
  const token = crypto.randomUUID();
  await file.save(buf, {
    metadata: {
      contentType,
      metadata: { firebaseStorageDownloadTokens: token },
    },
    resumable: false,
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

async function main() {
  console.log(`🔗 Supabase: ${SUPABASE_URL}`);
  console.log(`🔥 Firebase: gs://${bucketName}\n`);

  // 1. Fetch all entries from Supabase
  console.log('⏬ Fetching entries from Supabase...');
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch from Supabase:', error);
    process.exit(1);
  }

  const entries = (data ?? []) as SupabaseEntry[];
  console.log(`📄 Found ${entries.length} entries\n`);

  // 2. For each entry, copy photos and write doc
  let entrySuccess = 0;
  let entryFail = 0;
  let photoSuccess = 0;
  let photoFail = 0;
  const errors: { entry_id: string; reason: string }[] = [];

  for (const [idx, entry] of entries.entries()) {
    const { id, photo_urls, ...rest } = entry;
    const prefix = `[${idx + 1}/${entries.length}] ${id.slice(0, 8)}…`;

    try {
      // Copy photos
      const newPhotoUrls: string[] = [];
      for (const url of photo_urls ?? []) {
        try {
          const newUrl = await copyPhoto(url);
          newPhotoUrls.push(newUrl);
          photoSuccess += 1;
        } catch (err) {
          photoFail += 1;
          errors.push({ entry_id: id, reason: `photo ${url}: ${err instanceof Error ? err.message : String(err)}` });
        }
      }

      // Build Firestore doc
      const docData = {
        ...rest,
        photo_urls: newPhotoUrls,
      };

      await db.collection('entries').doc(id).set(docData);
      entrySuccess += 1;
      console.log(`✅ ${prefix} type="${entry.type}" photos=${newPhotoUrls.length}/${(photo_urls ?? []).length}`);
    } catch (err) {
      entryFail += 1;
      const reason = err instanceof Error ? err.message : String(err);
      errors.push({ entry_id: id, reason });
      console.log(`❌ ${prefix} FAILED: ${reason}`);
    }
  }

  // 3. Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📄 Entries:  ${entrySuccess}/${entries.length} migrated  (${entryFail} failed)`);
  console.log(`📸 Photos:   ${photoSuccess}/${photoSuccess + photoFail} migrated  (${photoFail} failed)`);
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors:`);
    errors.slice(0, 10).forEach((e) => console.log(`   • ${e.entry_id.slice(0, 8)}… → ${e.reason}`));
    if (errors.length > 10) console.log(`   …and ${errors.length - 10} more`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
