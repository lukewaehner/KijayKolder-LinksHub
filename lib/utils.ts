import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines conditional class name values into a single Tailwind-aware string.
 *
 * @param inputs - Class names or expressions that resolve to class names.
 * @returns A merged class name string with conflicting Tailwind utilities resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
