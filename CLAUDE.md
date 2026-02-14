# City Tracker - Project Context

## Overview
Mobile-first React web app for logging entries (electricity boards, billboards, etc.) while walking in the city. Designed for elderly users (70+) with large touch targets, high contrast, and simple navigation.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Storage)
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

## Supabase Setup

### CLI Commands
```bash
yarn supabase login      # Login to Supabase CLI
yarn supabase:link       # Link to remote project
yarn supabase:push       # Push migrations to remote
yarn supabase:start      # Start local Supabase (requires Docker)
yarn supabase:stop       # Stop local Supabase
yarn supabase:status     # View local credentials
yarn supabase:reset      # Reset local database
```

### Migrations
Located in `supabase/migrations/`:
- `20260214062359_create_entries_table.sql` - Creates `entries` table with RLS
- `20260214062410_create_photos_bucket.sql` - Creates `photos` storage bucket

### Environment Variables
Create `.env.local` with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get credentials from: Supabase Dashboard → Settings → API

## Project Structure
```
src/
├── components/     # Reusable UI components (Button, Select, Input, etc.)
├── screens/        # Full-page screens (HomeScreen, AddEntryScreen)
├── hooks/          # Custom React hooks (useGeolocation, usePhotoUpload, useSnackbar)
├── lib/            # Utilities (supabase client, i18n, localStorage helpers)
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

### Table: `entries`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| type | text | Entry type in English (e.g., "Electricity Board") |
| description | text | Optional user notes |
| latitude | float8 | GPS latitude |
| longitude | float8 | GPS longitude |
| address | text | Reverse-geocoded address |
| photo_urls | text[] | Array of storage URLs |
| created_at | timestamptz | Auto-generated timestamp |

**Note:** Entry `type` is always stored in English. Use `translateTypeName()` for display.

### Storage Bucket: `photos`
- Public read access
- Accepts: PNG, JPEG, WebP, HEIC
- Max file size: 10MB

## Key Features
1. **Type dropdown with memory** - Remembers last selected type via localStorage
2. **GPS auto-capture** - Gets location on Add screen, reverse geocodes via OpenStreetMap
3. **Photo upload** - Up to 3 photos per entry, uploaded to Supabase Storage
4. **Snackbar notifications** - Success/error toasts with 3s auto-dismiss
5. **Multi-language support** - English (default) and Hebrew with full RTL support

## localStorage Keys
- `lastEntryType`: Last selected entry type
- `entryTypes`: Custom types array (JSON)
- `language`: Current language ('en' | 'he')
