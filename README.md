# Menu Scan App

Expo SDK 52+ foundation for the Menu Scan MVP.

## Foundation Included (Steps 1–4)
- Expo Router app scaffold with Hermes + New Architecture
- Premium-ready light/dark design tokens + reusable UI primitives
- Tab shell: Home, Scan, Search, History, Profile
- Supabase client bootstrap (`src/lib/supabase.ts`)
- Initial SQL schema migration (`supabase/migrations/*_init.sql`)

## Env setup
Copy `.env.example` to `.env` and fill:

```bash
cp .env.example .env
```

Required now:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Run
```bash
npm install
npm run start
```

## Typecheck
```bash
npm run typecheck
```

## Notes
- Uses `react-native-reanimated` (no legacy Animated API)
- Uses `@shopify/flash-list` for list rendering standard
- Camera + notifications plugins pre-wired in `app.json`
