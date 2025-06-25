import { NextResponse } from "next/server";

import { videoApi } from "@/lib/supabase";

export async function GET() {
  try {
    const videos = await videoApi.getAll();

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);

    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const video = await videoApi.create(body);

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);

    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 },
    );
  }
}
