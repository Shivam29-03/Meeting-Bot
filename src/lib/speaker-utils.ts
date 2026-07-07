export function hashSpeakerName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function speakerHue(name: string): number {
  return hashSpeakerName(name) % 360;
}

export function speakerBackground(name: string): string {
  const hue = speakerHue(name);
  return `hsl(${hue}, 50%, 40%)`;
}

export function getSpeakerInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return trimmed[0]?.toUpperCase() ?? "?";
}
