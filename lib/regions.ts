/** Buyology regional offices (mock contact data + coordinates for the globe). */
export type Region = {
  id: string;
  city: string;
  flag: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  email: string;
  hours: string;
};

export const regions: Region[] = [
  {
    id: "uae",
    city: "Dubai",
    flag: "🇦🇪",
    lat: 25.2,
    lng: 55.27,
    address: "Marina Plaza, Level 20, Dubai Marina, Dubai",
    phone: "+971 4 555 0100",
    email: "uae@buyology.online",
    hours: "Sun–Thu · 9:00–18:00",
  },
  {
    id: "qatar",
    city: "Doha",
    flag: "🇶🇦",
    lat: 25.29,
    lng: 51.53,
    address: "West Bay Tower, Level 12, Doha",
    phone: "+974 4 455 0100",
    email: "qatar@buyology.online",
    hours: "Sun–Thu · 9:00–18:00",
  },
  {
    id: "saudi",
    city: "Riyadh",
    flag: "🇸🇦",
    lat: 24.71,
    lng: 46.68,
    address: "Kingdom Centre, Level 30, Riyadh",
    phone: "+966 11 555 0100",
    email: "ksa@buyology.online",
    hours: "Sun–Thu · 9:00–18:00",
  },
  {
    id: "bahrain",
    city: "Manama",
    flag: "🇧🇭",
    lat: 26.23,
    lng: 50.59,
    address: "Bahrain Bay, Level 8, Manama",
    phone: "+973 17 550 100",
    email: "bahrain@buyology.online",
    hours: "Sun–Thu · 9:00–18:00",
  },
  {
    id: "azerbaijan",
    city: "Baku",
    flag: "🇦🇿",
    lat: 40.41,
    lng: 49.87,
    address: "Port Baku Towers, Level 15, Baku",
    phone: "+994 12 555 0100",
    email: "baku@buyology.online",
    hours: "Mon–Fri · 9:00–18:00",
  },
];
