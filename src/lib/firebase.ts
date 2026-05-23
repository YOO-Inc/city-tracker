import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getFirestore, collection, addDoc, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import type { Entry, StructuredAddress } from '@/types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('Firebase credentials not configured. Please set VITE_FIREBASE_* keys in .env.local');
}

const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
const auth: Auth = getAuth(app);

// Sign in the client anonymously so security rules can enforce
// `request.auth != null`. Bots without a token get rejected before
// they can read/write. Consumers `await authReady` before any
// Firestore/Storage call to ensure the token is attached.
export const authReady: Promise<void> = (async () => {
  await auth.authStateReady();
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
})();

export async function uploadPhoto(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const utcDate = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';
  const fileName = `${utcDate}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  try {
    await authReady;
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  } catch (err) {
    console.error('Error uploading photo:', err);
    return null;
  }
}

export interface CreateEntryData {
  type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  address_he: string | null;
  address_en_structured?: StructuredAddress | null;
  address_he_structured?: StructuredAddress | null;
  photo_urls: string[];
}

export async function createEntry(entry: CreateEntryData): Promise<Entry> {
  const dbEntry: Record<string, unknown> = {
    type: entry.type,
    description: entry.description,
    latitude: entry.latitude,
    longitude: entry.longitude,
    address: entry.address,
    address_he: entry.address_he,
    photo_urls: entry.photo_urls,
    // Flat fields default to null so Firestore docs have a consistent shape
    house_number_en: null,
    street_en: null,
    neighborhood_en: null,
    city_en: null,
    county_en: null,
    state_en: null,
    postcode_en: null,
    country_en: null,
    country_code: null,
    house_number_he: null,
    street_he: null,
    neighborhood_he: null,
    city_he: null,
    county_he: null,
    state_he: null,
    postcode_he: null,
    country_he: null,
    created_at: new Date().toISOString(),
  };

  if (entry.address_en_structured) {
    const en = entry.address_en_structured;
    dbEntry.house_number_en = en.house_number;
    dbEntry.street_en = en.street;
    dbEntry.neighborhood_en = en.neighborhood;
    dbEntry.city_en = en.city;
    dbEntry.county_en = en.county;
    dbEntry.state_en = en.state;
    dbEntry.postcode_en = en.postcode;
    dbEntry.country_en = en.country;
    dbEntry.country_code = en.country_code;
  }

  if (entry.address_he_structured) {
    const he = entry.address_he_structured;
    dbEntry.house_number_he = he.house_number;
    dbEntry.street_he = he.street;
    dbEntry.neighborhood_he = he.neighborhood;
    dbEntry.city_he = he.city;
    dbEntry.county_he = he.county;
    dbEntry.state_he = he.state;
    dbEntry.postcode_he = he.postcode;
    dbEntry.country_he = he.country;
  }

  try {
    await authReady;
    const docRef = await addDoc(collection(db, 'entries'), dbEntry);
    return { id: docRef.id, ...dbEntry } as Entry;
  } catch (err) {
    console.error('Error creating entry:', err);
    throw err;
  }
}
