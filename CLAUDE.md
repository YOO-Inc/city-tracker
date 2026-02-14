# City Tracker - Project Context

## Overview
Mobile-first React web app for logging entries (electricity boards, billboards, etc.) while walking in the city. Designed for elderly users (70+) with large touch targets, high contrast, and simple navigation.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Storage)
- **Styling**: Tailwind CSS with elderly-optimized design tokens
- **i18n**: JSON-based (`src/locales/en.json`)

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
├── locales/        # Translation files (en.json)
├── types/          # TypeScript type definitions
├── App.tsx         # Main app with screen navigation
└── main.tsx        # React entry point
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
| type | text | Entry type (e.g., "Electricity Board") |
| description | text | Optional user notes |
| latitude | float8 | GPS latitude |
| longitude | float8 | GPS longitude |
| address | text | Reverse-geocoded address |
| photo_urls | text[] | Array of storage URLs |
| created_at | timestamptz | Auto-generated timestamp |

### Storage Bucket: `photos`
- Public read access
- Accepts: PNG, JPEG, WebP, HEIC
- Max file size: 10MB

## Key Features
1. **Type dropdown with memory** - Remembers last selected type via localStorage
2. **GPS auto-capture** - Gets location on Add screen, reverse geocodes via OpenStreetMap
3. **Photo upload** - Up to 3 photos per entry, uploaded to Supabase Storage
4. **Snackbar notifications** - Success/error toasts with 3s auto-dismiss

## localStorage Keys
- `lastEntryType`: Last selected entry type
- `entryTypes`: Custom types array (for future settings screen)
