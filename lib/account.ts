/** Mock signed-in user + account data (UI-only demo). */

export const account = {
  firstName: "Layla",
  lastName: "Ahmadova",
  email: "layla.ahmadova@example.com",
  phone: "+971 50 123 4567",
  initials: "LA",
  memberSince: "2023",
  tier: "Gold",
  points: 2450,
};

export type OrderStatus = "delivered" | "shipped" | "processing" | "cancelled";

export type Order = {
  id: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
};

export const orders: Order[] = [
  { id: "BX-10482", date: "12 Jun 2026", total: 1899, items: 2, status: "delivered" },
  { id: "BX-10310", date: "28 May 2026", total: 449, items: 1, status: "shipped" },
  { id: "BX-10188", date: "5 May 2026", total: 728, items: 3, status: "processing" },
  { id: "BX-09942", date: "18 Apr 2026", total: 199, items: 1, status: "cancelled" },
];

export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export const addresses: Address[] = [
  {
    id: "a1",
    label: "Home",
    name: "Layla Ahmadova",
    line1: "Marina Gate 2, Apt 1204",
    city: "Dubai",
    country: "United Arab Emirates",
    phone: "+971 50 123 4567",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Office",
    name: "Layla Ahmadova",
    line1: "One Central, Level 3",
    city: "Dubai",
    country: "United Arab Emirates",
    phone: "+971 4 555 0100",
    isDefault: false,
  },
];

export type Card = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
};

export const cards: Card[] = [
  { id: "c1", brand: "Visa", last4: "4242", expiry: "08/28", isDefault: true },
  { id: "c2", brand: "Mastercard", last4: "5309", expiry: "11/27", isDefault: false },
];
