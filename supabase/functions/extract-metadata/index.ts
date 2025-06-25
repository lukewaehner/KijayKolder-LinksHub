// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MetadataResult {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  duration?: number;
  bitrate?: number;
  format?: string;
  file_size: number;
  cover_art?: string;
  waveform_data?: number[];
  metadata: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fileUrl, trackId, fileName } = await req.json();

    if (!fileUrl || !trackId) {
      throw new Error("Missing required parameters: fileUrl and trackId");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the audio file
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Extract basic metadata from file extension and size
    const fileExtension = fileName
      ? fileName.split(".").pop()?.toLowerCase()
      : "mp3";
    const fileSize = buffer.length;

    // Estimate duration based on file size and bitrate (rough approximation)
    const estimatedBitrate = fileExtension === "flac" ? 1000000 : 320000; // 1Mbps for FLAC, 320kbps for MP3
    const estimatedDuration = Math.round((fileSize * 8) / estimatedBitrate);

    // Generate simple waveform data (placeholder - in production you'd use a proper audio analysis library)
    const waveformData = generateSimpleWaveform(estimatedDuration);

    const extractedData: MetadataResult = {
      title: fileName ? fileName.replace(/\.[^/.]+$/, "") : "Unknown Track",
      artist: "Unknown Artist",
      album: "",
      year: new Date().getFullYear().toString(),
      duration: estimatedDuration,
      bitrate: estimatedBitrate,
      format: `audio/${fileExtension}`,
      file_size: fileSize,
      waveform_data: waveformData,
      metadata: {
        filename: fileName,
        file_size: fileSize,
        format: `audio/${fileExtension}`,
        bitrate: estimatedBitrate,
        duration: estimatedDuration,
        extracted_at: new Date().toISOString(),
      },
    };

    // Update the track in the database
    const { data, error } = await supabase
      .from("tracks")
      .update({
        title: extractedData.title,
        artist: extractedData.artist,
        album: extractedData.album,
        duration: extractedData.duration,
        file_size: extractedData.file_size,
        waveform_data: extractedData.waveform_data,
        metadata: extractedData.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", trackId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...data,
          extracted_metadata: extractedData,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Error extracting metadata:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

// Generate simple waveform data for visualization
function generateSimpleWaveform(durationSeconds: number): number[] {
  const samples = Math.min(100, durationSeconds * 2); // 2 samples per second, max 100
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    // Generate random amplitude between 0.1 and 1.0
    const amplitude = 0.1 + Math.random() * 0.9;

    waveform.push(amplitude);
  }

  return waveform;
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/extract-metadata' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"fileUrl":"https://example.com/audio.mp3","trackId":"uuid","fileName":"audio.mp3"}'

*/
