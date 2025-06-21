import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to combine and merge Tailwind CSS classes.
 * It handles conflicts gracefully (e.g., merging `p-2` and `p-4` into just `p-4`).
 * @param inputs - A list of class names or class value objects.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
