/**
 * A simple string hashing function that produces a 32-bit integer hash
 * This is an implementation of djb2 hashing algorithm
 * @param str The string to hash
 * @returns A 32-bit integer hash of the string
 */
export function hashString(str: string): number {
  let hash = 5381;

  for (let i = 0; i < str.length; i++) {
    // hash * 33 + c
    hash = (hash << 5) + hash + str.charCodeAt(i);
    // Convert to 32bit integer
    hash = hash >>> 0;
  }

  return hash;
}
