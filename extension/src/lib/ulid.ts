// ULID (Universally Unique Lexicographically Sortable ID) generator
// 26 characters, Crockford Base32, timestamp prefix + random suffix

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeTime(timestamp: number, length: number): string {
  let result = '';
  for (let i = length - 1; i >= 0; i--) {
    const mod = timestamp % 32;
    result = CROCKFORD_BASE32[mod] + result;
    timestamp = Math.floor(timestamp / 32);
  }
  return result;
}

function encodeRandom(length: number): string {
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += CROCKFORD_BASE32[randomValues[i] % 32];
  }
  return result;
}

export function generateUlid(): string {
  const timestamp = Date.now();
  const timePart = encodeTime(timestamp, 10);
  const randomPart = encodeRandom(16);
  return timePart + randomPart;
}
