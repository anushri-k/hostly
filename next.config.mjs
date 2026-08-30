/** @type {import('next').NextConfig} */

// Deployed as a static site to GitHub Pages under /hostly. `basePath` is left
// empty for local dev so `next dev` still serves from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
