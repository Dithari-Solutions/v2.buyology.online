import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
