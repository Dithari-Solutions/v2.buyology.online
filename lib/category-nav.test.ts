import { test } from "node:test";
import assert from "node:assert/strict";
import { stockedCategories, categoryHref } from "./category-nav";
import type { Category } from "./catalogue";

test("navigation excludes empty, inactive and unavailable categories while retaining unbranded departments", () => {
  const categories: Category[] = [
    { id: "laptop", name: "Laptops", slug: "laptops", status: "ACTIVE" },
    { id: "empty", name: "Tablets", slug: "tablets" },
    { id: "audio", name: "Audio", slug: "audio" },
    { id: "deleted", name: "Old", slug: "old", status: "INACTIVE" },
    { id: "unnamed", name: " ", slug: "unnamed" },
  ];
  assert.deepEqual(stockedCategories(categories, new Set(["laptop", "audio", "deleted", "unnamed"]))
    .map((category) => category.id), ["laptop", "audio"]);
});

test("stocked subcategories link to their own products, excluding inactive ancestors and taxonomy cycles", () => {
  const categories: Category[] = [
    { id: "parent", name: "Computing", slug: "computing" },
    { id: "child", parentId: "parent", name: "Laptops", slug: "laptops" },
    { id: "inactive", name: "Hidden", slug: "hidden", status: "INACTIVE" },
    { id: "hidden-child", parentId: "inactive", name: "Hidden child", slug: "hidden-child" },
    { id: "cycle", parentId: "cycle", name: "Broken", slug: "broken" },
  ];
  const stocked = stockedCategories(categories, new Set(["child", "hidden-child", "cycle"]));
  assert.deepEqual(stocked.map((category) => category.id), ["child"]);
  assert.equal(categoryHref(stocked[0]), "/products?category=laptops");
});
