import { BadRequestException } from '@nestjs/common';

const FINGERPRINT_PATTERN = /^[0-9a-f]{16}$/i;
const FINGERPRINT_BITS = 64;

export function normalizeFingerprint(fingerprint: string): string {
  const normalized = fingerprint.trim().toLowerCase();

  if (!FINGERPRINT_PATTERN.test(normalized)) {
    throw new BadRequestException(
      'A visual fingerprint must contain exactly 16 hexadecimal characters.',
    );
  }

  return normalized;
}

export function fingerprintDistance(first: string, second: string): number {
  const firstValue = BigInt(`0x${normalizeFingerprint(first)}`);
  const secondValue = BigInt(`0x${normalizeFingerprint(second)}`);

  let difference = firstValue ^ secondValue;
  let distance = 0;

  while (difference > 0n) {
    distance += Number(difference & 1n);
    difference >>= 1n;
  }

  return distance;
}

export function fingerprintSimilarity(first: string, second: string): number {
  const distance = fingerprintDistance(first, second);

  return Number(
    (((FINGERPRINT_BITS - distance) / FINGERPRINT_BITS) * 100).toFixed(2),
  );
}
