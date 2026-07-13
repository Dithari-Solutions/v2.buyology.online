import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the higher-quality tier used for product imagery (Next 16 requires
    // every `quality` prop value to be allow-listed here).
    qualities: [75, 90],
  },
};

export default nextConfig;
