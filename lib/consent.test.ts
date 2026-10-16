import { test } from "node:test";
import assert from "node:assert/strict";
import { CONSENT_VERSION, newDecision, parseConsent } from "./consent";

test("a rejected or partial choice survives storage without gaining any permission", () => {
  const rejection = newDecision({ analytics: false, marketing: false }, "BANNER", "en", null);
  assert.deepEqual(parseConsent(encodeURIComponent(JSON.stringify(rejection))), rejection);
  const partial = newDecision({ analytics: true, marketing: false }, "SETTINGS", "ar", rejection);
  assert.equal(partial.consentId, rejection.consentId);
  assert.notEqual(partial.decisionId, rejection.decisionId);
  assert.equal(parseConsent(JSON.stringify(partial))?.marketing, false);
});
test("stale policy, expired preferences, and forged category types fail closed", () => {
  const valid = newDecision({ analytics: true, marketing: true }, "BANNER", "az", null);
  assert.equal(valid.version, CONSENT_VERSION);
  for (const bad of [{ ...valid, version: "old" }, { ...valid, expiresAt: "2000-01-01T00:00:00Z" },
    { ...valid, analytics: "false" }, { ...valid, marketing: 1 }, { ...valid, necessary: false },
    { ...valid, consentId: "arbitrary text" }, { ...valid, decisionId: "" }, { ...valid, source: "unknown" },
    { ...valid, expiresAt: "2999-01-01T00:00:00Z" }, { ...valid, language: "unknown" }]) {
    assert.equal(parseConsent(JSON.stringify(bad)), null);
  }
  assert.equal(parseConsent("%invalid"), null);
  assert.equal(parseConsent(null), null);
});
test("preferences expire exactly at their expiry instant", () => {
  const value = newDecision({ analytics: true, marketing: false }, "BANNER", "en", null);
  assert.ok(parseConsent(JSON.stringify(value), Date.parse(value.expiresAt) - 1));
  assert.equal(parseConsent(JSON.stringify(value), Date.parse(value.expiresAt)), null);
});
