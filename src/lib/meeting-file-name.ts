export function sanitizeMeetingFileName(title: string) {
  const normalized = title
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);

  return normalized || "meeting";
}
