import { createHash } from "node:crypto";

/**
 * Pure recap state/idempotency helpers (no DB / no network) so they are
 * unit-testable and deterministic.
 */

// Bump when the recap content format changes so a re-send is intentionally a
// distinct idempotency key rather than being deduped by the provider.
export const RECAP_VERSION = "v1";

// Upper bound on delivery attempts per recipient before we give up.
export const MAX_RECAP_ATTEMPTS = 3;

// A "processing" claim older than this is treated as stale (crashed mid-run)
// and may be re-claimed. 15 minutes comfortably exceeds a normal recap run.
export const STALE_PROCESSING_MS = 15 * 60 * 1000;

export type RecapDeliveryStatus = "queued" | "sent" | "failed";

export type RecapDelivery = {
  email: string;
  status: RecapDeliveryStatus;
  attempts: number;
  provider_message_id?: string | null;
  last_error?: string | null;
  sent_at?: Date | null;
};

export type RecapState =
  | "pending"
  | "processing"
  | "sent"
  | "partial"
  | "failed"
  | "skipped";

/**
 * Deterministic idempotency key for one (meeting, recipient, version). Uses a
 * SHA-256 hash so the raw recipient email is never sent to the provider as a
 * key value. Stable across retries and process restarts.
 */
export function recapIdempotencyKey(
  meetingId: string,
  recipientEmail: string,
  version: string = RECAP_VERSION,
): string {
  const normalized = recipientEmail.trim().toLowerCase();
  return createHash("sha256")
    .update(`recap:${version}:${meetingId}:${normalized}`)
    .digest("hex");
}

/**
 * Computes the overall meeting recap state from per-recipient deliveries.
 * - no recipients            -> "skipped"
 * - every recipient sent     -> "sent"
 * - at least one sent + one not -> "partial"
 * - none sent                -> "failed"
 */
export function computeOverallRecapState(deliveries: RecapDelivery[]): RecapState {
  if (deliveries.length === 0) {
    return "skipped";
  }

  const sent = deliveries.filter((delivery) => delivery.status === "sent").length;

  if (sent === deliveries.length) {
    return "sent";
  }
  if (sent > 0) {
    return "partial";
  }
  return "failed";
}

/**
 * Whether a recipient should be (re)attempted: not already delivered and not
 * past the retry budget.
 */
export function shouldAttemptDelivery(delivery: RecapDelivery): boolean {
  return delivery.status !== "sent" && delivery.attempts < MAX_RECAP_ATTEMPTS;
}
