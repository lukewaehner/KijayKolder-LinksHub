import { NextResponse } from "next/server";

import { videoApi } from "@/shared/lib/supabase/client";

export async function POST() {
  try {
    console.log("🔄 API: Setting Hibachi video as active...");
    
    // Get all videos and find hibachi by title
    const videos = await videoApi.getAll();
    const hibachiVideo = videos.find(v => 
      v.title.toLowerCase().includes('hibachi') ||
      v.file_url.includes('hibachi')
    );

    if (!hibachiVideo) {
      return NextResponse.json(
        { error: "Hibachi video not found" },
        { status: 404 }
      );
    }

    await videoApi.setActive(hibachiVideo.id);
    console.log("✅ API: Successfully set Hibachi video as active");

    return NextResponse.json({ 
      success: true, 
      message: "Hibachi video set as active",
      video: hibachiVideo
    });
  } catch (error) {
    console.error("❌ API: Error setting Hibachi active:", error);

    return NextResponse.json(
      { 
        error: "Failed to set Hibachi video as active",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 