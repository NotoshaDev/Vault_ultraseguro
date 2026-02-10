/**
 * Key Derivation Functions
 * Uses PBKDF2 to derive encryption keys from master password
 */

import { stringToArrayBuffer, arrayBufferToBase64, base64ToArrayBuffer, generateSalt, uint8ArrayToBase64, base64ToUint8Array } from './utils';

const PBKDF2_ITERATIONS = 100000; // Industry standard for strong security
const KEY_LENGTH = 256; // 256-bit key for AES-256

/**
 * Derive an encryption key from a master password using PBKDF2
 * This is the Zero-Knowledge magic: the key never leaves the client
 */
export async function deriveMasterKey(
  masterPassword: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Convert password to ArrayBuffer
  const passwordBuffer = stringToArrayBuffer(masterPassword);

  // Import password as a CryptoKey
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false, // Not extractable - security measure
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

/**
 * Create a hash of the master password for authentication
 * This is what gets sent to the server (NOT the encryption key)
 */
export async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const passwordBuffer = stringToArrayBuffer(password);
  
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  return arrayBufferToBase64(hashBuffer);
}

/**
 * Generate a new salt and derive both encryption key and auth hash
 */
export async function initializeMasterPassword(masterPassword: string): Promise<{
  encryptionKey: CryptoKey;
  authHash: string;
  salt: string;
}> {
  const salt = generateSalt();
  
  const [encryptionKey, authHash] = await Promise.all([
    deriveMasterKey(masterPassword, salt),
    hashPassword(masterPassword, salt),
  ]);

  return {
    encryptionKey,
    authHash,
    salt: uint8ArrayToBase64(salt),
  };
}

/**
 * Re-derive encryption key from stored salt
 * Used when user unlocks vault
 */
export async function unlockVault(
  masterPassword: string,
  storedSalt: string
): Promise<CryptoKey> {
  const salt = base64ToUint8Array(storedSalt);
  return deriveMasterKey(masterPassword, salt);
}

/**
 * Verify master password against stored hash
 */
export async function verifyMasterPassword(
  masterPassword: string,
  storedSalt: string,
  storedHash: string
): Promise<boolean> {
  const salt = base64ToUint8Array(storedSalt);
  const hash = await hashPassword(masterPassword, salt);
  return hash === storedHash;
}
