import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Re-export types from supabase
export type { Track, BackgroundVideo } from "@/lib/supabase";
