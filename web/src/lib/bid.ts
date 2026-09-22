/** Generates a fresh 32-byte value as a lowercase hex string using the browser's CSPRNG. */
export function randomHex32(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function shortHex(hex: string, lead = 8, tail = 6): string {
  if (hex.length <= lead + tail + 1) return hex;
  return `${hex.slice(0, lead)}…${hex.slice(-tail)}`;
}

export function isZeroHex(hex: string): boolean {
  return /^0*$/.test(hex);
}
