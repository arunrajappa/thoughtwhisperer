import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import 'server-only'; // Ensure this module is only used on the server if needed by server components

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
