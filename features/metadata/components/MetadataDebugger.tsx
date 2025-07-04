"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import Image from "next/image";

import { AudioMetadata } from "@/features/metadata/utils/metadata";

// Test tracks from your project
const testTracks = [
  "/audio/WAYTOOLONG.m4a",
  "/audio/NOPROBLEM.m4a",
  "/audio/DOITYOURSELF.m4a",
  "/audio/LIVE&LEARN.m4a",
];

export default function MetadataDebugger() {
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [selectedTrack, setSelectedTrack] = useState(testTracks[0]);

  const addLog = (message: string) => {
    console.log(message);
    setDebugLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testMetadataExtraction = async () => {
    setIsLoading(true);
    setError(null);
    setMetadata(null);
    setDebugLog([]);

    addLog(`Starting metadata extraction for: ${selectedTrack}`);

    try {
      addLog("Step 1: Testing fetch...");
      const response = await fetch(selectedTrack);

      if (!response.ok) {
        throw new Error(
          `Fetch failed: ${response.status} ${response.statusText}`
        );
      }

      addLog(
        `Fetch successful: ${response.status}, Content-Type: ${response.headers.get("content-type")}`
      );

      const blob = await response.blob();

      addLog(`Blob created: ${blob.size} bytes, type: ${blob.type}`);

      // Test if jsmediatags is available
      addLog("Step 2: Testing jsmediatags availability...");
      addLog("jsmediatags has been removed from the project");
      addLog("Metadata extraction is disabled");

      addLog("Step 3: Metadata extraction skipped - jsmediatags removed");

      addLog("Metadata extraction completed - no metadata available");
      addLog(
        `No metadata found: jsmediatags library has been removed from the project`
      );

      setMetadata({
        title: undefined,
        artist: undefined,
        album: undefined,
        year: undefined,
        genre: undefined,
        comment: undefined,
        trackNumber: undefined,
        coverArt: undefined,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      addLog(`ERROR: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setDebugLog([]);
    setError(null);
    setMetadata(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Metadata Extraction Debugger</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium" htmlFor="trackSelect">
              Select Test Track:
            </label>
            <select
              className="p-2 border rounded-md"
              id="trackSelect"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              {testTracks.map((track, index) => (
                <option key={index} value={track}>
                  {track.split("/").pop()?.replace(".m4a", "")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              color="primary"
              isDisabled={isLoading}
              onClick={testMetadataExtraction}
            >
              {isLoading ? (
                <Spinner color="white" size="sm" />
              ) : (
                "Test Metadata Extraction"
              )}
            </Button>
            <Button color="danger" variant="light" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Debug Log */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Debug Log</h3>
        </CardHeader>
        <CardBody>
          <div className="bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto">
            {debugLog.length === 0 ? (
              <p className="text-gray-500">
                No logs yet. Click &quot;Test Metadata Extraction&quot; to
                start.
              </p>
            ) : (
              <pre className="text-xs whitespace-pre-wrap">
                {debugLog.join("\n")}
              </pre>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-red-600">Error</h3>
          </CardHeader>
          <CardBody>
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Metadata Results */}
      {metadata && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-green-600">
              Extracted Metadata
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {metadata.coverArt?.dataURL && (
              <div className="flex justify-center">
                <Image
                  alt="Cover Art"
                  className="rounded-md shadow-md"
                  height={200}
                  src={metadata.coverArt.dataURL}
                  width={200}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Title:</div>
              <div>{metadata.title || "N/A"}</div>

              <div className="font-medium">Artist:</div>
              <div>{metadata.artist || "N/A"}</div>

              <div className="font-medium">Album:</div>
              <div>{metadata.album || "N/A"}</div>

              <div className="font-medium">Year:</div>
              <div>{metadata.year || "N/A"}</div>

              <div className="font-medium">Genre:</div>
              <div>{metadata.genre || "N/A"}</div>

              <div className="font-medium">Track Number:</div>
              <div>{metadata.trackNumber || "N/A"}</div>

              <div className="font-medium">Cover Art:</div>
              <div>
                {metadata.coverArt ? `Yes (${metadata.coverArt.format})` : "No"}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
