# City Tracker - Project Context

## Overview
Mobile-first React web app for logging entries (electricity boards, billboards, etc.) while walking in the city. Designed for elderly users (70+) with large touch targets, high contrast, and simple navigation.

## Language Priority
- **Hebrew-first**: The app is designed primarily for Hebrew speakers
- Default language is Hebrew with RTL layout
- All UI text must have Hebrew translations

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Firebase (Cloud Firestore + Firebase Storage)
- **Styling**: Tailwind CSS with elderly-optimized design tokens
- **i18n**: JSON-based with RTL support (`src/locales/en.json`, `src/locales/he.json`)

## Node & Package Manager

### Node Version
- **Version**: 24.11.0
- **Manager**: nave (see `.naverc`)
- Run `nave use` to activate the correct Node version

### Package Manager
- **Yarn**: 4.3.1 (via Corepack)
- **Config**: `.yarnrc.yml` with `nodeLinker: node-modules`
- Always use `yarn` commands, not `npm`

```bash
yarn install    # Install dependencies
yarn dev        # Start dev server (http://localhost:5173)
yarn build      # Production build
yarn preview    # Preview production build
```

## Firebase Setup

### Project
- **Project ID**: `city-tracker-17f45`
- **Console**: https://console.firebase.google.com/project/city-tracker-17f45
- **Firestore region**: `europe-west3`
- **Storage bucket**: `city-tracker-17f45.firebasestorage.app` (`US-CENTRAL1` no-cost location)
- **Plan**: Blaze with ₪1/month budget alert (50/90/100% thresholds)

### Infrastructure as Code
All Firebase config lives under `firebase/`:
- `firebase/firebase.json` - CLI config
- `firebase/firestore.rules` - Firestore security rules
- `firebase/storage.rules` - Storage security rules
- `firebase/firestore.indexes.json` - Composite index definitions

To deploy changes after editing these:
```bash
cd firebase && npx firebase-tools deploy --project city-tracker-17f45
```
Note: requires `firebase login` first (interactive OAuth). The service-account key approach hits IAM permission issues for rule deploys.

### Environment Variables
Create `.env.local` with:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=city-tracker-17f45.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=city-tracker-17f45
VITE_FIREBASE_STORAGE_BUCKET=city-tracker-17f45.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Get credentials from: Firebase Console → Project Settings → General → "Your apps" → Web app config.

### Dev Utilities
- `yarn clear:firebase` - Wipes all entries + photos (requires `FIREBASE_SERVICE_ACCOUNT_PATH` env var pointing at a downloaded service-account JSON). Useful for resetting a test environment.

### Migration history
The app moved from Supabase to Firebase on 2026-05-23. The full migration plan and step-by-step record is in `docs/supabase-to-firebase-migration.md`.

## Project Structure
```
src/
├── components/     # Reusable UI components (Button, Select, Input, etc.)
├── screens/        # Full-page screens (HomeScreen, AddEntryScreen)
├── hooks/          # Custom React hooks (useGeolocation, usePhotoUpload, useSnackbar)
├── lib/            # Utilities (firebase client, i18n, localStorage helpers)
├── locales/        # Translation files (en.json, he.json)
├── types/          # TypeScript type definitions
├── App.tsx         # Main app with screen navigation
└── main.tsx        # React entry point
```

## Internationalization (i18n)

### CRITICAL: Adding New Text/Copy
**When adding ANY user-facing text, you MUST add it to BOTH locale files:**
1. `src/locales/en.json` - English translation
2. `src/locales/he.json` - Hebrew translation

The TypeScript compiler will error if keys don't match between files.

### Using Translations
```typescript
import { t, translateTypeName } from '@/lib/i18n';

// Basic translation
t('home.title')  // Returns localized string

// For entry type names (stored in English in DB, displayed localized)
translateTypeName('Electricity Board')  // Returns "לוח חשמל" in Hebrew mode
```

### i18n Functions (from `src/lib/i18n.ts`)
| Function | Purpose |
|----------|---------|
| `t(key)` | Get translated string by key |
| `getLanguage()` | Get current language ('en' \| 'he') |
| `setLanguage(lang)` | Change language (persists to localStorage) |
| `isRTL()` | Check if current language is RTL |
| `translateTypeName(name)` | Translate default entry type names |
| `formatLocalizedDate(date, options)` | Format date for current locale |
| `formatLocalizedTime(date, options)` | Format time for current locale |

### Adding New Default Entry Types
If adding new default entry types, register translations in `src/lib/i18n.ts`:
```typescript
const TYPE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Electricity Board': { en: 'Electricity Board', he: 'לוח חשמל' },
  'Billboard': { en: 'Billboard', he: 'שלט פרסום' },
  // Add new types here
};
```

## RTL (Right-to-Left) Support

### CRITICAL: Use RTL-Safe CSS
The app supports Hebrew (RTL). **Never use directional CSS properties directly.**

### CSS Property Mapping
| DON'T USE | USE INSTEAD | Notes |
|-----------|-------------|-------|
| `left-*` | `start-*` | Positioning |
| `right-*` | `end-*` | Positioning |
| `ml-*` | `ms-*` | Margin-left → margin-inline-start |
| `mr-*` | `me-*` | Margin-right → margin-inline-end |
| `pl-*` | `ps-*` | Padding-left → padding-inline-start |
| `pr-*` | `pe-*` | Padding-right → padding-inline-end |
| `text-left` | `text-start` | Text alignment |
| `text-right` | `text-end` | Text alignment |

### RTL Utilities (defined in `src/index.css`)
```css
/* Logical positioning */
.start-0, .start-4, .start-5, .start-6, .end-0, .end-4, .end-5, .end-6

/* Logical margins */
.ms-0 through .ms-5, .me-0 through .me-5, .-ms-2, .-me-2

/* Logical padding */
.ps-0, .ps-4, .ps-5, .ps-12, .ps-14, .pe-0, .pe-4, .pe-5, .pe-12, .pe-14

/* Text alignment */
.text-start, .text-end
```

### Flipping Icons for RTL
For directional icons (arrows, chevrons), flip them in RTL:
```tsx
import { isRTL } from '@/lib/i18n';

<svg style={{ transform: isRTL() ? 'scaleX(-1)' : undefined }}>
  {/* arrow/chevron path */}
</svg>
```

### Fixed Positioning Example
```tsx
// DON'T: fixed bottom-6 right-6
// DO: fixed bottom-6 end-6

<button className="fixed bottom-6 end-6">...</button>
```

## Design System (Elderly-Optimized)

### Touch Targets
- Minimum: 56px (`h-touch`, `min-h-touch`)
- Primary buttons: 64px (`h-touch-lg`)

### Font Sizes
- `text-elderly-sm`: 18px
- `text-elderly-base`: 20px
- `text-elderly-lg`: 24px (buttons)
- `text-elderly-xl`: 28px
- `text-elderly-2xl`: 36px

### Colors
- Primary: `#1976D2` (blue)
- Primary dark: `#0D47A1`
- Success: `#2E7D32` (green)
- Error: `#C62828` (red)

## Database Schema

### Firestore Collection: `entries`
Auto-IDs (Firestore document IDs preserved from the original Supabase UUIDs after the migration).

Core fields on every doc:
| Field | Type | Notes |
|-------|------|-------|
| type | string | Entry type stored as snake_case English key (e.g., `electricity_board`). Use `translateTypeName()` for display |
| description | string \| null | Optional user notes |
| latitude | number | GPS latitude |
| longitude | number | GPS longitude |
| address | string \| null | Reverse-geocoded English display address |
| address_he | string \| null | Reverse-geocoded Hebrew display address |
| photo_urls | string[] | Array of Firebase Storage download URLs |
| created_at | string | ISO 8601 timestamp, set client-side at write time |

Additional structured-address fields (also flat on the doc, all `string \| null`):
- EN: `house_number_en`, `street_en`, `neighborhood_en`, `city_en`, `county_en`, `state_en`, `postcode_en`, `country_en`, `country_code`
- HE: `house_number_he`, `street_he`, `neighborhood_he`, `city_he`, `county_he`, `state_he`, `postcode_he`, `country_he`

See `src/types/index.ts` for the canonical `Entry` shape.

### Composite indexes
Defined in `firebase/firestore.indexes.json`:
- `entries`: `(type ASC, latitude ASC, longitude ASC)` — required by the duplicate-detection bbox query in `useNearbyEntries`. Uses Firestore's post-March-2024 multi-field range filter support.

### Storage: `photos/` prefix
- Path pattern: `photos/{ISO-with-hyphens}-{rand}.{ext}` (e.g., `photos/2026-05-23T10-30-45Z-abc123.jpg`)
- Download URLs are tokenized (`?alt=media&token=...`) from `getDownloadURL()`
- No file-size or content-type restrictions enforced by rules currently — worth adding later

## Key Features
1. **Type dropdown with memory** - Remembers last selected type via localStorage
2. **GPS auto-capture** - Gets location on Add screen, reverse geocodes via OpenStreetMap
3. **Photo upload** - Up to 3 photos per entry, uploaded to Firebase Storage
4. **Snackbar notifications** - Success/error toasts with 3s auto-dismiss
5. **Multi-language support** - English (default) and Hebrew with full RTL support

## localStorage Keys
- `lastEntryType`: Last selected entry type
- `entryTypes`: Custom types array (JSON)
- `language`: Current language ('en' | 'he')
