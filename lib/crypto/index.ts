/**
 * Main Crypto Export
 * Centralized export for all cryptographic functions
 */

export * from './utils';
export * from './keys';
export * from './encryption';

// Constants
export const CRYPTO_CONSTANTS = {
  PBKDF2_ITERATIONS: 100000,
  KEY_LENGTH: 256,
  SALT_LENGTH: 16,
  IV_LENGTH: 12,
  AUTO_LOCK_TIMEOUT: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;
