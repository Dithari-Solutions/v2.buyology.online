import { test } from "node:test";
import assert from "node:assert/strict";
import { productSchema } from "./structured-data";
import type { Product } from "./products";

const product: Product = { id: "product-id", sku: "REAL-SKU", name: "Example laptop", category: "Laptops", description: "A real product", tags: [], href: "/product/example-laptop", image: "", alt: "Example laptop", price: 999, oldPrice: 999, discount: 0, rating: 0, reviews: 0, currency: "AZN", refurbished: false };

test("a new item is not advertised as refurbished and an unknown manufacturer is not invented", () => {
  const result = productSchema(product);
  assert.equal(result.itemCondition, "https://schema.org/NewCondition");
  assert.equal(result.brand, undefined);
  assert.equal(result.aggregateRating, undefined);
  assert.equal(result.sku, "REAL-SKU");
});
test("the offer uses the visible market price and canonical URL, and zero stock is unavailable", () => {
  const result = productSchema({ ...product, availableUnits: 0, refurbished: true, brand: "Dell" }, "https://az.buyology.online/product/example-laptop?lang=az");
  const offer = result.offers as Record<string, unknown>;
  assert.equal(offer.priceCurrency, "AZN");
  assert.equal(offer.url, "https://az.buyology.online/product/example-laptop?lang=az");
  assert.equal(offer.availability, "https://schema.org/OutOfStock");
  assert.equal(offer.itemCondition, "https://schema.org/RefurbishedCondition");
});
