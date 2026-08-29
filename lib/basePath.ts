/**
 * Read by both server- and client-rendered components.
 * Synced with `basePath` in next.config.js via the NEXT_PUBLIC_BASE_PATH env var
 * (Next.js inlines NEXT_PUBLIC_* at build time so it works in client bundles).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prefix a public-relative path (e.g. "/photos/wall/brick.webp") with the basePath. */
export function asset(path: string): string {
  if (!path.startsWith('/')) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}
