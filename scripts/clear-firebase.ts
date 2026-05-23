/**
 * Verify and clear Firebase data (entries collection + photos in Storage).
 * Used to wipe test data before running the data migration from Supabase.
 *
 * Run: yarn clear:firebase
 * Reads FIREBASE_SERVICE_ACCOUNT_PATH from .env.local (via tsx --env-file).
 */
import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fs from 'node:fs';
import path from 'node:path';

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!keyPath) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT_PATH. Run via: yarn clear:firebase');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(keyPath), 'utf8')) as ServiceAccount;
const projectId = (serviceAccount as { project_id: string }).project_id;
const bucketName = `${projectId}.firebasestorage.app`;

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: bucketName,
});

const db = getFirestore(app);
const storage = getStorage(app);

async function main() {
  console.log(`🔍 Project: ${projectId}`);
  console.log(`📦 Bucket:  gs://${bucketName}\n`);

  // 1. Verify current state
  const snapshot = await db.collection('entries').get();
  console.log(`📄 Firestore entries: ${snapshot.size}`);
  if (snapshot.size > 0) {
    console.log('   Sample (first 3):');
    snapshot.docs.slice(0, 3).forEach((d) => {
      const data = d.data();
      console.log(`     • ${d.id.slice(0, 8)}… type="${data.type}" photos=${(data.photo_urls ?? []).length}`);
    });
  }

  const [files] = await storage.bucket().getFiles({ prefix: 'photos/' });
  console.log(`📸 Storage photos:   ${files.length}`);
  if (files.length > 0) {
    console.log('   Sample (first 3):');
    files.slice(0, 3).forEach((f) => console.log(`     • ${f.name}`));
  }

  if (snapshot.size === 0 && files.length === 0) {
    console.log('\n✅ Nothing to clear. Done.');
    return;
  }

  // 2. Delete everything
  console.log('\n🗑️  Clearing...');

  if (snapshot.size > 0) {
    const batch = db.batch();
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log(`   ✅ Deleted ${snapshot.size} Firestore docs`);
  }

  if (files.length > 0) {
    await Promise.all(files.map((f) => f.delete()));
    console.log(`   ✅ Deleted ${files.length} Storage files`);
  }

  // 3. Verify empty
  const afterDocs = await db.collection('entries').count().get();
  const [afterFiles] = await storage.bucket().getFiles({ prefix: 'photos/' });
  console.log(`\n📄 Firestore entries after: ${afterDocs.data().count}`);
  console.log(`📸 Storage photos after:    ${afterFiles.length}`);
  console.log('\n✅ Cleared.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Clear failed:', err);
    process.exit(1);
  });
