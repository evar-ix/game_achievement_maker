import { BadRequestException } from '@nestjs/common';

import {
  fingerprintDistance,
  fingerprintSimilarity,
  normalizeFingerprint,
} from './visual-fingerprint';

describe('visual fingerprint helpers', () => {
  it('normalizes a valid fingerprint', () => {
    expect(normalizeFingerprint(' A0B1C2D3E4F50607 ')).toBe('a0b1c2d3e4f50607');
  });

  it('rejects malformed fingerprints', () => {
    expect(() => normalizeFingerprint('not-a-hash')).toThrow(
      BadRequestException,
    );
  });

  it('calculates hamming distance and similarity', () => {
    expect(fingerprintDistance('0000000000000000', '000000000000000f')).toBe(4);
    expect(fingerprintSimilarity('0000000000000000', '000000000000000f')).toBe(
      93.75,
    );
  });
});
