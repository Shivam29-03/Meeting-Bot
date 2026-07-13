import assert from "node:assert/strict";
import test from "node:test";

import { buildRecapEmailContent } from "@/lib/recap-email-content";
import type { TranscriptSegment } from "@/lib/meeting-types";

const segments: TranscriptSegment[] = [
  { speaker: "Alice", speaker_id: 1, start: 0, end: 5, text: "Hello team." },
  { speaker: "Bob", speaker_id: 2, start: 5, end: 9, text: "Let's begin." },
];

test("subject includes the meeting title", () => {
  const { subject } = buildRecapEmailContent({
    title: "Q3 Planning",
    summary: "We planned Q3.",
    segments,
  });
  assert.equal(subject, "Meeting Recap — Q3 Planning");
});

test("summary is HTML-escaped (no injection)", () => {
  const { html } = buildRecapEmailContent({
    title: "T",
    summary: "<script>alert(1)</script> & <b>x</b>",
    segments,
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&amp;"));
});

test("title is HTML-escaped", () => {
  const { html } = buildRecapEmailContent({
    title: "<img src=x onerror=1>",
    summary: "ok",
    segments,
  });
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
});

test("transcript is attached as a .txt file when segments exist", () => {
  const { attachments } = buildRecapEmailContent({
    title: "Standup",
    summary: "ok",
    segments,
  });
  assert.equal(attachments.length, 1);
  assert.match(attachments[0].filename, /\.txt$/);
  assert.ok(attachments[0].content.includes("Alice"));
  assert.ok(attachments[0].content.includes("Hello team."));
});

test("no attachment when there is no transcript", () => {
  const { attachments, html } = buildRecapEmailContent({
    title: "Empty",
    summary: "ok",
    segments: [],
  });
  assert.equal(attachments.length, 0);
  assert.ok(html.includes("No transcript"));
});

test("video is never referenced (v1 excludes video)", () => {
  const { html, text, attachments } = buildRecapEmailContent({
    title: "T",
    summary: "ok",
    segments,
  });
  const haystack = (html + text + attachments.map((a) => a.filename).join()).toLowerCase();
  assert.ok(!haystack.includes(".mp4"));
  assert.ok(!haystack.includes("recall.ai"));
  assert.ok(!haystack.includes("video"));
});

test("plain-text fallback contains the summary", () => {
  const { text } = buildRecapEmailContent({
    title: "T",
    summary: "Key decision made.",
    segments,
  });
  assert.ok(text.includes("Key decision made."));
});

test("missing summary produces a safe placeholder", () => {
  const { html, text } = buildRecapEmailContent({
    title: "T",
    summary: null,
    segments,
  });
  assert.ok(text.includes("No summary is available"));
  assert.ok(html.includes("No summary is available"));
});
