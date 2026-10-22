import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchNavigationCatalogue, fetchCategoryBrands, fetchPopularProducts } from "./catalogue";
import { UAE_MARKET } from "./market";

test("category availability counts unbranded products and shares the brand request without mixing markets", async () => {
  const original = globalThis.fetch;
  const countries: string[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(String(input), "https://api.example.test");
    if (url.pathname === "/api/category") return Response.json({ data: [] });
    countries.push(url.searchParams.get("countryCode")!);
    return Response.json({ data: [
      { id: "one", categoryId: "laptops", brandId: "hp", brandName: "HP", availableInSelectedCountry: true },
      { id: "two", categoryId: "audio", availableInSelectedCountry: true },
      { id: "three", categoryId: "other-market", brandId: "dell", brandName: "Dell", availableInSelectedCountry: false },
    ] });
  };
  try {
    const market = { ...UAE_MARKET, countryCode: "NAV_TEST" };
    const [inventory, brands] = await Promise.all([fetchNavigationCatalogue("en", market), fetchCategoryBrands("en", market)]);
    assert.deepEqual([...inventory.categoryIds], ["laptops", "audio"]);
    assert.equal(brands.get("laptops")?.[0].name, "HP");
    assert.equal(brands.has("other-market"), false);
    assert.equal(countries.length, 1);
    await fetchNavigationCatalogue("en", { ...market, countryCode: "SECOND_MARKET" });
    assert.deepEqual(countries, ["NAV_TEST", "SECOND_MARKET"]);
  } finally { globalThis.fetch = original; }
});

test("popular selection uses real review engagement, deduplicates products and omits unavailable stock", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = new URL(String(input), "https://api.example.test");
    if (url.pathname === "/api/category") return Response.json({ data: [] });
    const row = { storePrice: 500, title: "Laptop", availableInSelectedCountry: true };
    return Response.json({ data: [
      { ...row, id: "less-reviewed", totalReviews: 1, averageRating: 5 },
      { ...row, id: "most-reviewed", totalReviews: 12, averageRating: 4.8 },
      { ...row, id: "most-reviewed", totalReviews: 12, averageRating: 4.8 },
      { ...row, id: "sold-out", totalReviews: 100, availableQuantity: 0 },
      { ...row, id: "unavailable", totalReviews: 100, availableInSelectedCountry: false },
      { ...row, id: "no-stock", availabilityStatus: "OUT_OF_STOCK" },
      { ...row, id: "untracked", availableQuantity: null },
    ] });
  };
  try {
    assert.deepEqual((await fetchPopularProducts("az")).map((product) => product.id), ["most-reviewed", "less-reviewed", "untracked"]);
  } finally { globalThis.fetch = original; }
});
