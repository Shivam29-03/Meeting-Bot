/**
 * Server-authoritative recap recipient handling.
 *
 * Pure functions (no DB / no network) so they are unit-testable and safe to
 * reuse both at meeting-creation time and defensively inside the recap
 * orchestrator. Frontend validation is UX-only; this is the source of truth.
 */

// Reasonable upper bounds to prevent unbounded payloads / abuse.
export const MAX_RECAP_RECIPIENTS = 25;
export const MAX_RAW_RECIPIENT_ENTRIES = 200;
const MAX_EMAIL_LENGTH = 254;

// Pragmatic, conservative email syntax check. Deliberately not RFC-exhaustive;
// the goal is to reject clearly malformed input, not to guarantee deliverability.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = normalizeEmail(value);
  if (!normalized || normalized.length > MAX_EMAIL_LENGTH) {
    return false;
  }
  return EMAIL_PATTERN.test(normalized);
}

/**
 * Accepts recipients as either an array of strings or a single delimited
 * string (comma / newline / semicolon separated), tolerating whatever the
 * client sends. Returns a normalized, de-duplicated, validated list.
 */
export function parseRecipientInput(input: unknown): string[] {
  let rawEntries: string[];

  if (Array.isArray(input)) {
    rawEntries = input.filter((item): item is string => typeof item === "string");
  } else if (typeof input === "string") {
    rawEntries = input.split(/[\n,;]+/);
  } else {
    rawEntries = [];
  }

  // Bound work before doing anything expensive.
  rawEntries = rawEntries.slice(0, MAX_RAW_RECIPIENT_ENTRIES);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of rawEntries) {
    const normalized = normalizeEmail(entry);
    if (!normalized || seen.has(normalized) || !isValidEmail(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

/**
 * Builds the final recipient list for a meeting: validated explicit recipients
 * plus the authenticated organizer email (V1 policy), de-duplicated and capped.
 * The organizer is only auto-included when it is itself a valid email.
 */
export function buildRecapRecipients(
  input: unknown,
  organizerEmail: string | null | undefined,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  const add = (email: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized || seen.has(normalized) || !isValidEmail(normalized)) {
      return;
    }
    seen.add(normalized);
    result.push(normalized);
  };

  // Organizer first so they are never dropped by the cap.
  if (organizerEmail) {
    add(organizerEmail);
  }

  for (const email of parseRecipientInput(input)) {
    if (result.length >= MAX_RECAP_RECIPIENTS) {
      break;
    }
    add(email);
  }

  return result;
}
