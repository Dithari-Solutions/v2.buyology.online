import { test } from "node:test";
import assert from "node:assert/strict";
import { purchaseMarket, sameCountry } from "./market";

test("Azerbaijan and UAE aliases are equivalent without mixing countries", () => {
  assert.ok(sameCountry(" az ", "AZE"));
  assert.ok(sameCountry("ARE", "UAE"));
  assert.ok(sameCountry("AE", "UAE"));
  assert.equal(sameCountry("UAE", "AZE"), false);
  assert.equal(sameCountry(null, ""), false);
});
test("a current Azerbaijan IP selects its local store before a purchase", () => {
  assert.equal(purchaseMarket("buyology.online", "AZ", false).redirectHost, "az.buyology.online");
  assert.equal(purchaseMarket("v2.buyology.online", "AZ", false).redirectHost, "az.buyology.online");
  assert.equal(purchaseMarket("az.buyology.online", "AZ", false).market.countryCode, "AZE");
  assert.equal(purchaseMarket("az.buyology.online", "AZ", false).market.paymentsEnabled, true);
  assert.equal(purchaseMarket("az.buyology.online", "AZ", false).redirectHost, null);
});
test("travel changes the market, while a missing geo signal preserves the host", () => {
  assert.equal(purchaseMarket("az.buyology.online", "AE", false).redirectHost, "buyology.online");
  assert.equal(purchaseMarket("az.buyology.online", null, false).market.countryCode, "AZE");
  assert.equal(purchaseMarket("az.buyology.online", null, false).redirectHost, null);
});
test("explicit browsing choice and proxy restrictions follow the page rules", () => {
  assert.equal(purchaseMarket("buyology.online", "US", false, "buyology.online").redirectHost, null);
  assert.equal(purchaseMarket("buyology.online", "US", false).redirectHost, "web.buyology.online");
  assert.equal(purchaseMarket("az.buyology.online", "AZ", true).redirectHost, "web.buyology.online");
  assert.equal(purchaseMarket("localhost:3000", "AZ", false).redirectHost, null);
});
