# Video Background Admin Control — Design Spec

**Date:** 2026-04-02
**Status:** Approved

## Problem

The main page background video always shows the hardcoded fallback (`/videos/louder.mov`) instead of the video selected in the admin panel. The admin panel correctly reads and writes to the `background_videos` Supabase table, but the main page component (`components/BackgroundVideo.tsx`) silently fails to fetch the active video and falls through to the fallback with no visible error.

## Root Cause

`app/layout-content.tsx` imports from the old `components/BackgroundVideo.tsx`, which:
- Has no error visibility (errors are caught and silently return `null`)
- Uses the older import path (`@/lib/dataService`)

A newer, better component already exists at `features/background/components/BackgroundVideo.tsx` with proper error overlays, logging, and the correct import chain — but it was never wired into the layout.

## Solution

**Two targeted changes:**

### 1. Update the import in `app/layout-content.tsx`

Change:
```ts
import BackgroundVideo from "@/components/BackgroundVideo";
```
To:
```ts
import BackgroundVideo from "@/features/background/components/BackgroundVideo";
```

### 2. Remove the real-time Supabase subscription from `features/background/components/BackgroundVideo.tsx`

Real-time updates are not required. When an admin changes the active video, the next page visit will pick up the correct video. The real-time subscription adds complexity and a dependency on `supabase.channel()` that is unnecessary.

Remove the subscription setup and teardown from the `useEffect`, leaving only the `loadVideo()` call on mount.

## Data Flow (after fix)

```
app/layout-content.tsx
  → features/background/components/BackgroundVideo.tsx
    → shared/lib/data/service.ts :: getBackgroundVideo()
      → shared/lib/supabase/client.ts :: videoApi.getActive()
        → Supabase: SELECT * FROM background_videos WHERE is_active = true LIMIT 1
```

## Fallback Behavior

- While loading: shows a dark gradient (no video)
- If fetch fails or returns null: shows the same dark gradient + a red error overlay (visible for debugging)
- If a video is found: renders the `<video>` element with the DB file URL

The hardcoded fallback video (`/videos/louder.mov`) is no longer rendered by this component. It remains available in `config/fallback-video.ts` if needed elsewhere.

## Out of Scope

- Real-time video switching (not needed)
- Cleaning up the old `components/BackgroundVideo.tsx` (safe to leave in place for now)
- Consolidating the old `lib/` vs `shared/lib/` duplication (separate concern)

## Success Criteria

1. After an admin sets a video active in the admin panel, a fresh page load on the main page shows that video as the background.
2. If no video is active in the DB, the page shows a dark gradient (not a broken video element).
3. If the fetch fails, a visible error message appears to aid debugging.
