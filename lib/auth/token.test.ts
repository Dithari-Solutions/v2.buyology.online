import { test, after } from "node:test";
import assert from "node:assert/strict";
import { setSession, clearSession, hasSessionHint } from "./token";

const local = new Map<string, string>();
let cookie = "";
let cookieBlocked = false;
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { hostname: "az.buyology.online" } } });
Object.defineProperty(globalThis, "document", { configurable: true, value: {
  get cookie() { if (cookieBlocked) throw new Error("blocked"); return cookie; },
  set cookie(value: string) { if (cookieBlocked) throw new Error("blocked"); cookie = value; },
} });
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
  getItem: (key: string) => local.get(key) ?? null,
  setItem: (key: string, value: string) => local.set(key, value),
  removeItem: (key: string) => local.delete(key),
} });
after(() => { ["window", "document", "localStorage"].forEach((key) => Reflect.deleteProperty(globalThis, key)); });

test("a region change can restore the session without storing a token in a readable cookie", () => {
  setSession("test-access-token", 3600);
  assert.ok(cookie.includes("Domain=buyology.online"));
  assert.ok(cookie.includes("Secure")); assert.ok(!cookie.includes("test-access-token"));
  local.clear(); cookie = "other=value; buyo_has_session=1";
  assert.equal(hasSessionHint(), true);
  clearSession(); assert.ok(cookie.includes("Max-Age=0"));
  cookie = ""; assert.equal(hasSessionHint(), false);
});

test("blocked cookies do not prevent sign-in or logout", () => {
  cookieBlocked = true;
  assert.doesNotThrow(() => setSession("test-access-token", 3600));
  assert.equal(hasSessionHint(), true);
  assert.doesNotThrow(() => clearSession());
  assert.equal(hasSessionHint(), false);
  cookieBlocked = false;
});
