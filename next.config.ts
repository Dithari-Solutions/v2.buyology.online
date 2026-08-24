import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// web-app-1 and web-app-2 build independently behind the load balancer. With Next's
// default random build ID, HTML served by one server references /_next/static/<id>/
// chunks the other cannot serve → ChunkLoadError for every second visitor. Tying the
// build ID to the commit keeps independent builds of the same commit consistent.
// (Same fix, same reason, as the old storefront.)
function resolveBuildId(): string | null {
  if (process.env.NEXT_BUILD_ID) return process.env.NEXT_BUILD_ID;
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return null; // fall back to Next's default
  }
}

const nextConfig: NextConfig = {
  // Self-contained server in .next/standalone — deployed exactly like the old
  // storefront (copy static/ + public/ in, pm2 runs server.js).
  output: "standalone",
  generateBuildId: resolveBuildId,
  images: {
    // Allow the higher-quality tier used for product imagery (Next 16 requires
    // every `quality` prop value to be allow-listed here).
    qualities: [75, 90],
    // WebP only: AVIF encodes are ~5-10x slower and the presigned-URL cache key rotates
    // every ~4h, so the expensive encode would recur per product forever.
    formats: ["image/webp"],
    // Product photos are ~200KB source PNGs served straight from Contabo with no CDN;
    // routing them through /_next/image resizes them to card size in WebP (~10-20KB)
    // and caches the variants on this server. The backend keeps each presigned URL
    // byte-identical for ~4h, so the optimizer cache actually gets hits.
    // Scoped to OUR buckets (path-style keys) — a bare wildcard host would let anyone
    // funnel foreign Contabo objects through this server's optimizer cache.
    remotePatterns: [
      { protocol: "https", hostname: "eu2.contabostorage.com", pathname: "/ecommerce-storage/**" },
      { protocol: "https", hostname: "usc1.contabostorage.com", pathname: "/buyology-dev/**" },
    ],
    // Floor for upstream responses that carry no Cache-Control (non-product presigns).
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
