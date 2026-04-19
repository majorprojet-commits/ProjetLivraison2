import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchWithTimeout(resource: string, options: any = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  console.log(`[Fetch] Starting ${resource}...`);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    console.log(`[Fetch] Finished ${resource} with status ${response.status}`);
    
    // Add a helper to safely parse JSON
    (response as any).safeJson = async () => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      const text = await response.text();
      console.error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}...`);
      throw new Error(`Invalid JSON response from ${resource}`);
    };

    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
