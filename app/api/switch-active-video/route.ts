import { NextRequest, NextResponse } from "next/server";

import { videoApi } from "@/shared/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    console.log("🔄 API: Switching active video to:", videoId);
    await videoApi.setActive(videoId);
    console.log("✅ API: Successfully switched active video");

    return NextResponse.json({ 
      success: true, 
      message: "Active video switched successfully" 
    });
  } catch (error) {
    console.error("❌ API: Error switching active video:", error);

    return NextResponse.json(
      { 
        error: "Failed to switch active video",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 