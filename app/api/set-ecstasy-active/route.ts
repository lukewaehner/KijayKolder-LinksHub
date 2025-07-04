import { NextResponse } from "next/server";

import { videoApi } from "@/shared/lib/supabase/client";

export async function POST() {
  try {
    console.log("🔄 API: Setting Ecstasy video as active...");
    
    // Get all videos and find ecstasy by title
    const videos = await videoApi.getAll();
    const ecstasyVideo = videos.find(v => 
      v.title.toLowerCase().includes('ecstasy') ||
      v.file_url.includes('ecstasy')
    );

    if (!ecstasyVideo) {
      return NextResponse.json(
        { error: "Ecstasy video not found" },
        { status: 404 }
      );
    }

    await videoApi.setActive(ecstasyVideo.id);
    console.log("✅ API: Successfully set Ecstasy video as active");

    return NextResponse.json({ 
      success: true, 
      message: "Ecstasy video set as active",
      video: ecstasyVideo
    });
  } catch (error) {
    console.error("❌ API: Error setting Ecstasy active:", error);

    return NextResponse.json(
      { 
        error: "Failed to set Ecstasy video as active",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 