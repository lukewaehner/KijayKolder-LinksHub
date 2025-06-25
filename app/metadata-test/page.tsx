"use client";

import { useState, useRef } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import Image from "next/image";

import {
  AudioMetadata,
  extractAudioMetadata,
  revokeCoverArtURL,
} from "@/lib/audioMetadata";
import MetadataAudioPlayer from "@/components/MetadataAudioPlayer";
import MetadataDebugger from "@/components/MetadataDebugger";

// Define test tracks
const testTracks = [
  "/audio/WAYTOOLONG.m4a",
  "/audio/NOPROBLEM.m4a",
  "/audio/DOITYOURSELF.m4a",
  "/audio/LIVE&LEARN.m4a",
];

export default function MetadataTestPage() {
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testUrl, setTestUrl] = useState(testTracks[0]);
  const [showPlayer, setShowPlayer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractMetadata = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clean up previous cover art URL if it exists
      if (metadata?.coverArt?.dataURL) {
        revokeCoverArtURL(metadata.coverArt.dataURL);
      }

      // Call the metadata extraction function from our library
      const response = await fetch(testUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audio file: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const meta = await extractAudioMetadata(blob);

      setMetadata(meta);
      console.log("Extracted metadata:", meta);
    } catch (err) {
      setError(
        `Error extracting metadata: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error("Failed to extract metadata:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      // Clean up previous metadata URL if it exists
      if (metadata?.coverArt?.dataURL) {
        revokeCoverArtURL(metadata.coverArt.dataURL);
      }

      const meta = await extractAudioMetadata(files[0]);

      setMetadata(meta);
      console.log("Extracted metadata from file:", meta);
    } catch (err) {
      setError(
        `Error extracting metadata: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error("Failed to extract metadata:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayer = () => {
    setShowPlayer(!showPlayer);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Audio Metadata Extraction Test
      </h1>

      {/* Advanced Debugger */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Advanced Debug Tool</h2>
        <MetadataDebugger />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader>
            <h2 className="text-xl font-semibold">Quick Test</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <label className="font-medium" htmlFor="audioUrlSelect">
                  Audio URL
                </label>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border rounded-md flex-grow"
                    id="audioUrlSelect"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                  >
                    {testTracks.map((track, index) => (
                      <option key={index} value={track}>
                        {track.split("/").pop()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    isDisabled={isLoading}
                    onClick={extractMetadata}
                  >
                    {isLoading ? (
                      <Spinner color="white" size="sm" />
                    ) : (
                      "Extract Metadata"
                    )}
                  </Button>
                  <Button onClick={togglePlayer}>
                    {showPlayer ? "Hide Player" : "Show Player"}
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <label className="font-medium" htmlFor="audioFileUpload">
                  Or Upload Audio File
                </label>
                <input
                  ref={fileInputRef}
                  accept="audio/*"
                  className="mt-2 w-full"
                  id="audioFileUpload"
                  type="file"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <h2 className="text-xl font-semibold">Quick Results</h2>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            ) : metadata ? (
              <div className="space-y-4">
                {metadata.coverArt?.dataURL && (
                  <div className="flex justify-center">
                    <Image
                      alt="Cover Art"
                      className="object-contain rounded-md shadow-md"
                      height={200}
                      src={metadata.coverArt.dataURL}
                      width={200}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Title:</div>
                    <div>{metadata.title || "Unknown"}</div>

                    <div className="font-medium">Artist:</div>
                    <div>{metadata.artist || "Unknown"}</div>

                    <div className="font-medium">Album:</div>
                    <div>{metadata.album || "Unknown"}</div>

                    <div className="font-medium">Year:</div>
                    <div>{metadata.year || "Unknown"}</div>

                    <div className="font-medium">Genre:</div>
                    <div>{metadata.genre || "Unknown"}</div>

                    {metadata.trackNumber && (
                      <>
                        <div className="font-medium">Track:</div>
                        <div>{metadata.trackNumber}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Click "Extract Metadata" to see results
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {showPlayer && (
        <div className="mt-8">
          <Card className="p-4">
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Audio Player with Metadata
              </h2>
            </CardHeader>
            <CardBody>
              <MetadataAudioPlayer tracks={[testUrl]} />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
