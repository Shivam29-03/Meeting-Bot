import assert from "node:assert/strict";
import test from "node:test";

import {
  computeOverallRecapState,
  MAX_RECAP_ATTEMPTS,
  recapIdempotencyKey,
  shouldAttemptDelivery,
  type RecapDelivery,
} from "@/lib/recap-state";

function delivery(overrides: Partial<RecapDelivery>): RecapDelivery {
  return {
    email: "a@example.com",
    status: "queued",
    attempts: 0,
    provider_message_id: null,
    last_error: null,
    sent_at: null,
    ...overrides,
  };
}

test("idempotency key is deterministic and sha256 hex", () => {
  const k1 = recapIdempotencyKey("m1", "a@example.com");
  const k2 = recapIdempotencyKey("m1", "A@Example.com"); // normalized
  assert.equal(k1, k2);
  assert.match(k1, /^[a-f0-9]{64}$/);
});

test("idempotency key differs by meeting, recipient, and version", () => {
  assert.notEqual(
    recapIdempotencyKey("m1", "a@example.com"),
    recapIdempotencyKey("m2", "a@example.com"),
  );
  assert.notEqual(
    recapIdempotencyKey("m1", "a@example.com"),
    recapIdempotencyKey("m1", "b@example.com"),
  );
  assert.notEqual(
    recapIdempotencyKey("m1", "a@example.com", "v1"),
    recapIdempotencyKey("m1", "a@example.com", "v2"),
  );
});

test("computeOverallRecapState covers all cases", () => {
  assert.equal(computeOverallRecapState([]), "skipped");
  assert.equal(
    computeOverallRecapState([delivery({ status: "sent" }), delivery({ status: "sent" })]),
    "sent",
  );
  assert.equal(
    computeOverallRecapState([delivery({ status: "sent" }), delivery({ status: "failed" })]),
    "partial",
  );
  assert.equal(
    computeOverallRecapState([delivery({ status: "failed" }), delivery({ status: "queued" })]),
    "failed",
  );
});

test("shouldAttemptDelivery skips sent and exhausted recipients", () => {
  assert.equal(shouldAttemptDelivery(delivery({ status: "queued", attempts: 0 })), true);
  assert.equal(shouldAttemptDelivery(delivery({ status: "failed", attempts: 1 })), true);
  assert.equal(shouldAttemptDelivery(delivery({ status: "sent", attempts: 1 })), false);
  assert.equal(
    shouldAttemptDelivery(delivery({ status: "failed", attempts: MAX_RECAP_ATTEMPTS })),
    false,
  );
});
