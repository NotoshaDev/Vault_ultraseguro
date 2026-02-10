/**
 * Encryption and Decryption Functions
 * Uses AES-256-GCM for secure encryption of secrets
 */

import {
  stringToArrayBuffer,
  arrayBufferToString,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateIV,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from './utils';

/**
 * Encrypt data using AES-256-GCM
 * Returns encrypted data with IV (needed for decryption)
 */
export async function encryptData(
  data: string,
  encryptionKey: CryptoKey
): Promise<{ encryptedData: string; iv: string }> {
  // Generate a unique IV for this encryption
  const iv = generateIV();

  // Convert data to ArrayBuffer
  const dataBuffer = stringToArrayBuffer(data);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    encryptionKey,
    dataBuffer
  );

  // Convert to base64 for storage
  return {
    encryptedData: arrayBufferToBase64(encryptedBuffer),
    iv: uint8ArrayToBase64(iv),
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decryptData(
  encryptedData: string,
  iv: string,
  encryptionKey: CryptoKey
): Promise<string> {
  try {
    // Convert from base64
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const ivArray = base64ToUint8Array(iv);

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray as BufferSource,
      },
      encryptionKey,
      encryptedBuffer
    );

    // Convert back to string
    return arrayBufferToString(decryptedBuffer);
  } catch (error) {
    throw new Error('Decryption failed. Invalid key or corrupted data.');
  }
}

/**
 * Encrypt a complete secret object
 * Encrypts all sensitive fields individually
 */
export async function encryptSecret(
  secret: {
    name: string;
    username?: string;
    password: string;
    url?: string;
    notes?: string;
  },
  encryptionKey: CryptoKey
): Promise<{
  encryptedData: string;
  iv: string;
}> {
  // Serialize the entire secret object
  const secretJson = JSON.stringify(secret);
  
  // Encrypt as a single blob
  return encryptData(secretJson, encryptionKey);
}

/**
 * Decrypt a complete secret object
 */
export async function decryptSecret(
  encryptedData: string,
  iv: string,
  encryptionKey: CryptoKey
): Promise<{
  name: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
}> {
  const decryptedJson = await decryptData(encryptedData, iv, encryptionKey);
  return JSON.parse(decryptedJson);
}

/**
 * Batch encrypt multiple secrets
 * Useful for initial vault encryption or bulk operations
 */
export async function encryptSecretsBatch(
  secrets: Array<{
    id: string;
    name: string;
    username?: string;
    password: string;
    url?: string;
    notes?: string;
  }>,
  encryptionKey: CryptoKey
): Promise<
  Array<{
    id: string;
    encryptedData: string;
    iv: string;
  }>
> {
  const encryptedSecrets = await Promise.all(
    secrets.map(async (secret) => {
      const { id, ...secretData } = secret;
      const encrypted = await encryptSecret(secretData, encryptionKey);
      return {
        id,
        ...encrypted,
      };
    })
  );

  return encryptedSecrets;
}

/**
 * Batch decrypt multiple secrets
 */
export async function decryptSecretsBatch(
  encryptedSecrets: Array<{
    id: string;
    encryptedData: string;
    iv: string;
  }>,
  encryptionKey: CryptoKey
): Promise<
  Array<{
    id: string;
    name: string;
    username?: string;
    password: string;
    url?: string;
    notes?: string;
  }>
> {
  const decryptedSecrets = await Promise.all(
    encryptedSecrets.map(async (encrypted) => {
      const { id, encryptedData, iv } = encrypted;
      const secret = await decryptSecret(encryptedData, iv, encryptionKey);
      return {
        id,
        ...secret,
      };
    })
  );

  return decryptedSecrets;
}
