import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, trackId, fileName } = await request.json();

    if (!fileUrl || !trackId) {
      return NextResponse.json(
        { error: "Missing required parameters: fileUrl and trackId" },
        { status: 400 },
      );
    }

    // Call the Supabase function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/extract-metadata`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl,
          trackId,
          fileName,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Supabase function error:", errorText);

      return NextResponse.json(
        { error: "Metadata extraction failed" },
        { status: response.status },
      );
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("API route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
