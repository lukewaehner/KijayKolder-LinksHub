# Track Loading Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the "Loading tracks..." spinner after the entrance animation by starting the Supabase fetch immediately on page mount instead of waiting for the animation to finish.

**Architecture:** Lift `getTracks()` from `AudioPlayerSection` up to `app/page.tsx` so it fires in parallel with the entrance animation. `AudioPlayerSection` becomes a pure display component that accepts `tracks` and `loading` as props. By the time the ~1-2s animation completes, the fetch has already returned.

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, Supabase JS client

---

## File Map

| File | Change |
|------|--------|
| `features/audio-player/components/AudioPlayerSection.tsx` | Remove internal fetch; accept `tracks` and `loading` as props |
| `app/page.tsx` | Add `getTracks()` fetch on mount; pass `tracks`/`loading` to `AudioPlayerSection`; update import path |

---

### Task 1: Convert `AudioPlayerSection` to accept props

**Files:**
- Modify: `features/audio-player/components/AudioPlayerSection.tsx`

Remove the internal `getTracks()` fetch and replace with props. The component signature changes from `()` to `({ tracks, loading }: Props)`. All other logic (glitch effects, player rendering, track change handlers) is untouched.

- [ ] **Step 1: Read the current file**

Read `features/audio-player/components/AudioPlayerSection.tsx` and confirm it currently:
- Imports `getTracks, Track` from `@/shared/lib/data/service`
- Has `const [tracks, setTracks] = useState<Track[]>([]);` and `const [loading, setLoading] = useState(true);`
- Has a `useEffect` that calls `getTracks()` and sets state

- [ ] **Step 2: Update the imports and add Props type**

Change the top of the file from:
```tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";

import DatabaseMetadataAudioPlayer from "@/features/audio-player/components/DatabaseMetadataAudioPlayer";
import { getTracks, Track } from "@/shared/lib/data/service";
```

To:
```tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";

import DatabaseMetadataAudioPlayer from "@/features/audio-player/components/DatabaseMetadataAudioPlayer";
import { Track } from "@/shared/lib/data/service";

interface Props {
  tracks: Track[];
  loading: boolean;
}
```

- [ ] **Step 3: Update the function signature and remove internal state/fetch**

Change the function signature and remove the internal tracks/loading state and fetch `useEffect`. Replace:

```tsx
export default function AudioPlayerSection() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load tracks from database
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const tracksData = await getTracks();

        setTracks(tracksData);
      } catch (error) {
        console.error("Error loading tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);
```

With:

```tsx
export default function AudioPlayerSection({ tracks, loading }: Props) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
```

Everything after this point in the file (the glitch effects, distortion interval, JSX) remains completely unchanged.

- [ ] **Step 4: Commit**

```bash
git add features/audio-player/components/AudioPlayerSection.tsx
git commit -m "refactor: AudioPlayerSection accepts tracks/loading as props"
```

---

### Task 2: Fetch tracks in `app/page.tsx` and pass down

**Files:**
- Modify: `app/page.tsx`

Add `getTracks()` fetch on mount at the page level. Pass `tracks` and `loading` to `AudioPlayerSection`. Update the import to point at the `features/` path.

- [ ] **Step 1: Replace the file contents**

Replace `app/page.tsx` entirely with:

```tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import SwipeableLayout from "@/components/SwipeableLayout";
import AudioPlayerSection from "@/features/audio-player/components/AudioPlayerSection";
import LinksSection from "@/components/LinksSection";
import EntranceAnimation from "@/components/EntranceAnimation";
import { getTracks, Track } from "@/shared/lib/data/service";

export default function Home() {
  const [showEntrance, setShowEntrance] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);

  // Start fetching tracks immediately — runs in parallel with entrance animation
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const data = await getTracks();

        setTracks(data);
      } catch (error) {
        console.error("Error loading tracks:", error);
      } finally {
        setTracksLoading(false);
      }
    };

    loadTracks();
  }, []);

  const handleEntranceComplete = () => {
    setShowEntrance(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showEntrance && (
          <EntranceAnimation
            key="entrance"
            onComplete={handleEntranceComplete}
          />
        )}
      </AnimatePresence>

      {!showEntrance && (
        <SwipeableLayout
          sections={[
            <AudioPlayerSection
              key="audio"
              loading={tracksLoading}
              tracks={tracks}
            />,
            <LinksSection key="links" />,
          ]}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "perf: prefetch tracks on page mount in parallel with entrance animation"
```

---

### Task 3: Verify the fix works

**Files:** none (manual verification)

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open the app and time the loading**

Open `http://localhost:3000`. Watch the entrance animation play. When it completes and the audio player section appears, tracks should render immediately with no "Loading tracks..." spinner.

If "Loading tracks..." still appears briefly, the network was slower than the animation — this is acceptable. If it persists for more than a second, check the browser console for Supabase errors.

- [ ] **Step 3: Verify no regression**

- Tracks display correctly
- Track switching works
- Glitch effects still fire
- The second swipe section (Links) still renders correctly
