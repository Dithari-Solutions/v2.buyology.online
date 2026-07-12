import type { ComponentType, SVGProps } from "react";
import {
  GamepadIcon,
  HeadphonesIcon,
  HouseIcon,
  LaptopIcon,
  SparklesIcon,
  WatchIcon,
} from "@/components/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  href: string;
  image: string;
  alt: string;
  /** Category motif shown faintly over the placeholder image. */
  icon: IconType;
  price: number;
  oldPrice: number;
  discount: number;
  rating: number;
  /** Number of customer reviews behind the rating. */
  reviews: number;
  bestseller?: boolean;
};

/**
 * Mock flash-deal / trending products. Swap `image` for real product photos
 * (square, ~800px) — the card layout is unchanged.
 */
export const flashDeals: Product[] = [
  {
    id: "aura-watch",
    name: "Aura Smart Watch",
    category: "Wearables",
    description: "Titanium smartwatch with 14-day battery and on-wrist health AI.",
    tags: ["AMOLED", "14-day", "Health AI"],
    href: "/search?q=aura%20smart%20watch",
    image: "/mock/products/aura-watch.jpg",
    alt: "Aura Smart Watch on a silver studio backdrop",
    icon: WatchIcon,
    price: 279,
    oldPrice: 399,
    discount: 30,
    rating: 4.8,
    reviews: 2431,
    bestseller: true,
  },
  {
    id: "cyber-headphones",
    name: "Cyber Headphones X",
    category: "Audio",
    description: "Adaptive ANC over-ears with spatial audio and 40-hour battery.",
    tags: ["ANC", "Spatial", "40h"],
    href: "/search?q=cyber%20headphones",
    image: "/mock/products/cyber-headphones.jpg",
    alt: "Cyber Headphones X on a gold studio backdrop",
    icon: HeadphonesIcon,
    price: 199,
    oldPrice: 299,
    discount: 33,
    rating: 4.7,
    reviews: 1204,
  },
  {
    id: "orbit-drone",
    name: "Orbit Drone Mini",
    category: "Aerial",
    description: "Foldable 4K drone with obstacle avoidance and auto-follow.",
    tags: ["4K", "30-min", "Auto-follow"],
    href: "/search?q=orbit%20drone",
    image: "/mock/products/orbit-drone.jpg",
    alt: "Orbit Drone Mini on a green studio backdrop",
    icon: SparklesIcon,
    price: 449,
    oldPrice: 649,
    discount: 31,
    rating: 4.6,
    reviews: 876,
    bestseller: true,
  },
  {
    id: "vortex-vr",
    name: "Vortex VR Lens",
    category: "Mixed Reality",
    description: "Pancake-lens mixed-reality headset with 4K-per-eye clarity.",
    tags: ["4K/eye", "Passthrough", "120Hz"],
    href: "/search?q=vortex%20vr",
    image: "/mock/products/vortex-vr.jpg",
    alt: "Vortex VR Lens on a violet studio backdrop",
    icon: SparklesIcon,
    price: 379,
    oldPrice: 540,
    discount: 30,
    rating: 4.5,
    reviews: 543,
  },
  {
    id: "pulse-buds",
    name: "Pulse Buds Pro",
    category: "Audio",
    description: "Wireless earbuds with lossless audio, ANC and IPX5 sweat-proofing.",
    tags: ["Lossless", "ANC", "IPX5"],
    href: "/search?q=pulse%20buds",
    image: "/mock/products/pulse-buds.jpg",
    alt: "Pulse Buds Pro on a rose studio backdrop",
    icon: HeadphonesIcon,
    price: 149,
    oldPrice: 219,
    discount: 32,
    rating: 4.7,
    reviews: 3190,
  },
  {
    id: "nimbus-laptop",
    name: "Nimbus 16 Laptop",
    category: "Computing",
    description: "16-inch OLED laptop with a neural co-processor and 32GB memory.",
    tags: ["OLED", "32GB", "AI chip"],
    href: "/search?q=nimbus%20laptop",
    image: "/mock/products/nimbus-laptop.jpg",
    alt: "Nimbus 16 Laptop on a blue studio backdrop",
    icon: LaptopIcon,
    price: 1899,
    oldPrice: 2299,
    discount: 17,
    rating: 4.9,
    reviews: 612,
    bestseller: true,
  },
  {
    id: "helix-console",
    name: "Helix Console",
    category: "Gaming",
    description: "Handheld-hybrid console with a 1440p OLED and dockable play.",
    tags: ["1440p", "OLED", "Hybrid"],
    href: "/search?q=helix%20console",
    image: "/mock/products/helix-console.jpg",
    alt: "Helix Console on a purple studio backdrop",
    icon: GamepadIcon,
    price: 599,
    oldPrice: 749,
    discount: 20,
    rating: 4.8,
    reviews: 1458,
  },
  {
    id: "orbit-hub",
    name: "Orbit Home Hub",
    category: "Home",
    description: "Smart-home hub with on-device voice AI and Matter support.",
    tags: ["Matter", "Voice AI", "Zigbee"],
    href: "/search?q=orbit%20home%20hub",
    image: "/mock/products/orbit-hub.jpg",
    alt: "Orbit Home Hub on a warm studio backdrop",
    icon: HouseIcon,
    price: 129,
    oldPrice: 179,
    discount: 28,
    rating: 4.6,
    reviews: 928,
  },
];

const productById = new Map(flashDeals.map((p) => [p.id, p]));

/** Full catalogue detail for a product id (rating, specs, description…). */
export function getProduct(id: string): Product | undefined {
  return productById.get(id);
}
