/**
 * The site is a standalone static export served from the root of its host,
 * so there is no basePath by default — `next dev` and `next build` both
 * produce a site reachable at `/`.
 *
 * Pass BASE_PATH=/whatever to serve it from a sub-path instead
 * (e.g. BASE_PATH=/montana pnpm build). The same value is exposed to the
 * bundle as NEXT_PUBLIC_BASE_PATH, which is what `lib/basePath.ts` reads.
 */
const basePath = process.env.BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
