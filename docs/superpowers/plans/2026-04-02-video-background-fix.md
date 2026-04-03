# Video Background Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the main page background video load from Supabase (whichever video the admin marked active) instead of always showing the hardcoded fallback.

**Architecture:** Swap the layout's import to use the existing `features/background/components/BackgroundVideo.tsx`, which has the correct fetch chain and visible error handling. Strip the unused real-time Supabase subscription from that component since admin changes only need to take effect on next page visit.

**Tech Stack:** Next.js 14 (App Router), React, Supabase JS client, TypeScript, Tailwind CSS

---

## File Map

| File | Change |
|------|--------|
| `features/background/components/BackgroundVideo.tsx` | Remove real-time subscription; remove unused `supabase` import |
| `app/layout-content.tsx` | Update import path |

---

### Task 1: Simplify `BackgroundVideo.tsx` — remove real-time subscription

**Files:**
- Modify: `features/background/components/BackgroundVideo.tsx`

The current component imports `supabase` solely for the real-time channel subscription. Since we don't need live updates, both the import and the subscription block can be removed, leaving a clean `useEffect` that just fetches the active video on mount.

- [ ] **Step 1: Open the file and verify current contents**

Read `features/background/components/BackgroundVideo.tsx` and confirm lines 1–87 match what's expected (the `useEffect` currently contains both `loadVideo()` and a `supabase.channel(...)` subscription block).

- [ ] **Step 2: Replace the file contents**

Replace the entire file with the following:

```tsx
"use client";

import { useState, useEffect } from "react";

import { getBackgroundVideo } from "@/shared/lib/data/service";
import { BackgroundVideo as BackgroundVideoType } from "@/shared/types";

export default function BackgroundVideo() {
  const [video, setVideo] = useState<BackgroundVideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        const activeVideo = await getBackgroundVideo();

        setVideo(activeVideo);
      } catch (error) {
        console.error("Error loading background video:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load video"
        );
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, []);

  if (loading || !video) {
    return (
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none" />
        {error && (
          <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded text-sm z-50 pointer-events-auto">
            Video Error: {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full blur-sm brightness-50 md:brightness-25 pointer-events-none"
        poster={video.thumbnail_url || "/images/video-placeholder.png"}
        preload="auto"
        onError={() => setError(`Video playback failed: ${video.title}`)}
      >
        <source src={video.file_url} type="video/mp4" />
        <source src={video.file_url} type="video/quicktime" />
        <source src={video.file_url} type="video/mov" />
      </video>
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none" />
      )}
      {error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded text-sm max-w-xs z-50 pointer-events-auto">
          Video Error: {error}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add features/background/components/BackgroundVideo.tsx
git commit -m "fix: simplify BackgroundVideo — remove unused real-time subscription"
```

---

### Task 2: Wire the correct component into the layout

**Files:**
- Modify: `app/layout-content.tsx`

The layout currently imports from the old `components/BackgroundVideo` path. One line change.

- [ ] **Step 1: Update the import**

In `app/layout-content.tsx`, change line 5 from:

```ts
import BackgroundVideo from "@/components/BackgroundVideo";
```

to:

```ts
import BackgroundVideo from "@/features/background/components/BackgroundVideo";
```

No other changes to this file.

- [ ] **Step 2: Commit**

```bash
git add app/layout-content.tsx
git commit -m "fix: wire layout to features/background BackgroundVideo component"
```

---

### Task 3: Verify the fix works

**Files:** none (manual verification)

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check the main page**

Open `http://localhost:3000` in the browser. You should see the video that's marked active in the admin panel playing as the background — not `louder.mov`.

If you see a **red error overlay** in the top-right corner instead:
- The video URL stored in Supabase may be inaccessible (wrong bucket permissions or broken URL)
- Check the browser console for the specific error message
- Verify the video file is publicly accessible in Supabase Storage > videos bucket

If you see the **dark gradient** with no error and no video:
- `getBackgroundVideo()` returned null — no video is marked `is_active = true` in the `background_videos` table
- Go to the admin panel, find a video, and click "Set Active"
- Refresh the main page

- [ ] **Step 3: Test the admin → main page flow end-to-end**

1. Go to `/admin`
2. In the Background Videos section, click "Set Active" on a different video
3. Open a new tab / hard refresh `http://localhost:3000`
4. Confirm the new active video is playing

- [ ] **Step 4: Confirm fallback behavior**

In `app/layout-content.tsx`, temporarily point the import back at the old component, confirm the fallback (`louder.mov`) plays, then revert. This proves the new component is actually being used.

(Optional — skip if the main test in Step 3 was conclusive.)
