import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRecapRecipients,
  isValidEmail,
  MAX_RECAP_RECIPIENTS,
  normalizeEmail,
  parseRecipientInput,
} from "@/lib/recap-recipients";

const ORG = "organizer@example.com";

test("isValidEmail accepts well-formed and rejects malformed", () => {
  assert.equal(isValidEmail("a@b.com"), true);
  assert.equal(isValidEmail("A.B-c@sub.domain.io"), true);
  assert.equal(isValidEmail("no-at-sign"), false);
  assert.equal(isValidEmail("a@b"), false);
  assert.equal(isValidEmail("a@@b.com"), false);
  assert.equal(isValidEmail("a b@c.com"), false);
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail(123 as unknown as string), false);
});

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Foo@Bar.COM "), "foo@bar.com");
});

test("parseRecipientInput handles array and delimited string", () => {
  assert.deepEqual(parseRecipientInput(["a@x.com"]), ["a@x.com"]);
  assert.deepEqual(
    parseRecipientInput("a@x.com, b@x.com\nc@x.com;d@x.com"),
    ["a@x.com", "b@x.com", "c@x.com", "d@x.com"],
  );
});

test("single valid email + organizer auto-included", () => {
  const out = buildRecapRecipients(["alice@example.com"], ORG);
  assert.deepEqual(out, [ORG, "alice@example.com"]);
});

test("multiple emails, whitespace trimmed, uppercase normalized, deduped", () => {
  const out = buildRecapRecipients(
    ["  Alice@Example.com ", "bob@example.com", "ALICE@example.com"],
    ORG,
  );
  assert.deepEqual(out, [ORG, "alice@example.com", "bob@example.com"]);
});

test("invalid emails are dropped, valid ones kept", () => {
  const out = buildRecapRecipients(["good@example.com", "bad", "also bad@x"], ORG);
  assert.deepEqual(out, [ORG, "good@example.com"]);
});

test("omitted / empty recipient input yields organizer only", () => {
  assert.deepEqual(buildRecapRecipients(undefined, ORG), [ORG]);
  assert.deepEqual(buildRecapRecipients([], ORG), [ORG]);
  assert.deepEqual(buildRecapRecipients("", ORG), [ORG]);
});

test("organizer is included exactly once even if also supplied", () => {
  const out = buildRecapRecipients([ORG, "x@example.com"], ORG);
  assert.deepEqual(out, [ORG, "x@example.com"]);
});

test("recipient count is capped (organizer preserved)", () => {
  const many = Array.from({ length: 100 }, (_, i) => `user${i}@example.com`);
  const out = buildRecapRecipients(many, ORG);
  assert.equal(out.length, MAX_RECAP_RECIPIENTS);
  assert.equal(out[0], ORG);
});

test("no organizer email still returns valid recipients", () => {
  assert.deepEqual(buildRecapRecipients(["a@example.com"], null), ["a@example.com"]);
  assert.deepEqual(buildRecapRecipients(["a@example.com"], "not-an-email"), [
    "a@example.com",
  ]);
});
