import { NextResponse } from "next/server";

import { trackApi } from "@/lib/supabase";

export async function GET() {
  try {
    const tracks = await trackApi.getAll();

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);

    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 },
    );
  }
}
