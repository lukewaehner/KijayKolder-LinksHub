"use client";

import { usePathname } from "next/navigation";

import BackgroundVideo from "@/features/background/components/BackgroundVideo";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if we're on a utility/admin route that needs scrolling
  const isUtilityRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/docs") ||
    pathname?.startsWith("/blog") ||
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/metadata-test");

  if (isUtilityRoute) {
    // Utility pages layout: scrollable, no background video, light background
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="relative">{children}</main>
      </div>
    );
  }

  // Main app layout: fixed height, background video, dark theme
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* <RotatingBackground /> */}
      <BackgroundVideo />
      <main className="relative z-20 h-screen">{children}</main>
      <footer className="fixed bottom-0 left-0 w-full flex items-center justify-center py-1 text-xs text-white/50 z-30 pointer-events-none">
        KijayKolder &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
