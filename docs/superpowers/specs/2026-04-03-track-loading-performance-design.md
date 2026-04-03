# Track Loading Performance — Design Spec

**Date:** 2026-04-03
**Status:** Approved

## Problem

Tracks appear slow to load because the Supabase fetch doesn't start until after the entrance animation completes. The current flow is sequential:

```
Page load → entrance animation (~1-2s) → AudioPlayerSection mounts → useEffect fires → getTracks() → tracks render
```

The fetch is blocked behind the animation, so users always wait at least the full animation duration plus a network round-trip before seeing tracks.

## Solution

Lift the `getTracks()` call up to `app/page.tsx` so it fires immediately when the page mounts — in parallel with the entrance animation. By the time the animation finishes, the Supabase response has already returned and tracks render instantly.

## Changes

### 1. `app/page.tsx`

- Add `tracks` and `tracksLoading` state
- Start `getTracks()` in a `useEffect([])` immediately on mount
- Pass `tracks` and `tracksLoading` as props to `AudioPlayerSection`
- Update import to point at `@/features/audio-player/components/AudioPlayerSection` (same migration pattern as BackgroundVideo fix)

### 2. `features/audio-player/components/AudioPlayerSection.tsx`

- Accept `tracks: Track[]` and `loading: boolean` as props
- Remove the internal `getTracks()` fetch and its `useEffect`
- Remove `getTracks` import from `@/shared/lib/data/service`
- Everything else (glitch effects, player rendering, track change handlers) stays identical

## Data Flow (after fix)

```
app/page.tsx mounts
  ├── useEffect: getTracks() fires immediately        ← parallel
  └── EntranceAnimation plays (~1-2s)                ← parallel

Animation completes → AudioPlayerSection mounts with tracks already in props → renders immediately
```

## Fallback

If `getTracks()` errors, `tracks` stays `[]` and `loading` stays `false`. `AudioPlayerSection` already handles the empty state with "No tracks available".

## Out of Scope

- Caching / server-side fetching (future improvement)
- Changes to `DatabaseMetadataAudioPlayer` or other sub-components
- Cleaning up `components/AudioPlayerSection.tsx` (old file, left in place)

## Success Criteria

1. After the entrance animation completes, tracks appear immediately with no "Loading tracks..." spinner visible.
2. If the network is slow and the fetch hasn't completed by the time the animation finishes, the spinner still shows — this is acceptable and not a regression.
