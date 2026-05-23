/**
 * Read-only backup of Supabase data to local disk.
 *
 * Run: yarn backup:supabase
 * Writes:
 *   backups/supabase-YYYY-MM-DD/entries.json
 *   backups/supabase-YYYY-MM-DD/photos/<original-filename>
 *   backups/supabase-YYYY-MM-DD/summary.json
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env.local
 * (loaded via tsx --env-file).
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Run via: yarn backup:supabase');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const today = new Date().toISOString().slice(0, 10);
const backupDir = path.resolve('backups', `supabase-${today}`);
const photosDir = path.join(backupDir, 'photos');

async function main() {
  await fs.mkdir(photosDir, { recursive: true });
  console.log(`📁 Backup directory: ${backupDir}`);

  // 1. Dump entries table
  console.log('⏬ Fetching entries...');
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch entries:', error);
    process.exit(1);
  }

  const entriesFile = path.join(backupDir, 'entries.json');
  await fs.writeFile(entriesFile, JSON.stringify(entries, null, 2));
  console.log(`✅ Saved ${entries?.length ?? 0} entries to ${entriesFile}`);

  // 2. Download every photo referenced by any entry
  const allUrls = (entries ?? []).flatMap((e: { photo_urls?: string[] }) => e.photo_urls ?? []);
  const uniqueUrls = [...new Set(allUrls)];
  console.log(`⏬ Downloading ${uniqueUrls.length} photos...`);

  let downloaded = 0;
  let failed = 0;
  const errors: { url: string; reason: string }[] = [];

  for (const url of uniqueUrls) {
    try {
      const filename = url.split('/').pop();
      if (!filename) throw new Error('Could not derive filename');
      const dest = path.join(photosDir, filename);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(dest, buf);
      downloaded += 1;
      process.stdout.write(`  ${downloaded}/${uniqueUrls.length}\r`);
    } catch (err) {
      failed += 1;
      errors.push({ url, reason: err instanceof Error ? err.message : String(err) });
    }
  }

  // 3. Summary file (also human-readable)
  const summary = {
    timestamp: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    entries_count: entries?.length ?? 0,
    photos_downloaded: downloaded,
    photos_failed: failed,
    errors,
  };
  await fs.writeFile(path.join(backupDir, 'summary.json'), JSON.stringify(summary, null, 2));

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Entries:   ${entries?.length ?? 0}`);
  console.log(`✅ Photos:    ${downloaded}/${uniqueUrls.length}`);
  if (failed > 0) console.log(`⚠️  Failed:    ${failed} (see summary.json)`);
  console.log(`📁 Location:  ${backupDir}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch((err) => {
  console.error('❌ Backup failed:', err);
  process.exit(1);
});
