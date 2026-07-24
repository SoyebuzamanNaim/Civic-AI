import crypto from 'crypto';

/**
 * Generates a high-entropy, human-friendly public tracking code.
 * Format: TRK-XXXX-XXXX (8 uppercase alphanumeric characters)
 */
export function generateTrackingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars (0,1,O,I)
  const bytes = crypto.randomBytes(8);
  let codePart1 = '';
  let codePart2 = '';

  for (let i = 0; i < 4; i++) {
    codePart1 += chars[bytes[i] % chars.length];
  }
  for (let i = 4; i < 8; i++) {
    codePart2 += chars[bytes[i] % chars.length];
  }

  return `TRK-${codePart1}-${codePart2}`;
}
