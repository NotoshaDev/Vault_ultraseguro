'use client';

import { useState, useCallback, useRef } from 'react';
import {
  initializeMasterPassword,
  unlockVault,
  verifyMasterPassword,
  encryptSecret,
  decryptSecret,
  encryptSecretsBatch,
  decryptSecretsBatch,
} from '@/lib/crypto';

interface UseCryptoReturn {
  encryptionKey: CryptoKey | null;
  isUnlocked: boolean;
  initializeVault: (masterPassword: string) => Promise<{
    authHash: string;
    salt: string;
  }>;
  unlock: (masterPassword: string, salt: string, authHash: string) => Promise<boolean>;
  lock: () => void;
  encrypt: (data: {
    name: string;
    username?: string;
    password: string;
    url?: string;
    notes?: string;
  }) => Promise<{ encryptedData: string; iv: string }>;
  decrypt: (
    encryptedData: string,
    iv: string
  ) => Promise<{
    name: string;
    username?: string;
    password: string;
    url?: string;
    notes?: string;
  }>;
  encryptBatch: (
    secrets: Array<{
      id: string;
      name: string;
      username?: string;
      password: string;
      url?: string;
      notes?: string;
    }>
  ) => Promise<Array<{ id: string; encryptedData: string; iv: string }>>;
  decryptBatch: (
    encryptedSecrets: Array<{
      id: string;
      encryptedData: string;
      iv: string;
    }>
  ) => Promise<
    Array<{
      id: string;
      name: string;
      username?: string;
      password: string;
      url?: string;
      notes?: string;
    }>
  >;
}

/**
 * Custom hook for managing cryptographic operations
 * Handles encryption key lifecycle and vault lock state
 */
export function useCrypto(): UseCryptoReturn {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);

  // Keep key in ref for batch operations
  const isUnlocked = encryptionKey !== null;

  /**
   * Initialize a new vault with a master password
   */
  const initializeVault = useCallback(async (masterPassword: string) => {
    const { encryptionKey: key, authHash, salt } = await initializeMasterPassword(
      masterPassword
    );
    
    setEncryptionKey(key);
    keyRef.current = key;

    return { authHash, salt };
  }, []);

  /**
   * Unlock existing vault with master password
   */
  const unlock = useCallback(
    async (masterPassword: string, salt: string, authHash: string): Promise<boolean> => {
      try {
        // First verify the password
        const isValid = await verifyMasterPassword(masterPassword, salt, authHash);
        
        if (!isValid) {
          return false;
        }

        // Derive encryption key
        const key = await unlockVault(masterPassword, salt);
        setEncryptionKey(key);
        keyRef.current = key;

        return true;
      } catch (error) {
        console.error('Unlock failed:', error);
        return false;
      }
    },
    []
  );

  /**
   * Lock the vault (clear encryption key from memory)
   */
  const lock = useCallback(() => {
    setEncryptionKey(null);
    keyRef.current = null;
  }, []);

  /**
   * Encrypt a single secret
   */
  const encrypt = useCallback(
    async (data: {
      name: string;
      username?: string;
      password: string;
      url?: string;
      notes?: string;
    }) => {
      if (!keyRef.current) {
        throw new Error('Vault is locked. Please unlock first.');
      }

      return encryptSecret(data, keyRef.current);
    },
    []
  );

  /**
   * Decrypt a single secret
   */
  const decrypt = useCallback(
    async (encryptedData: string, iv: string) => {
      if (!keyRef.current) {
        throw new Error('Vault is locked. Please unlock first.');
      }

      return decryptSecret(encryptedData, iv, keyRef.current);
    },
    []
  );

  /**
   * Encrypt multiple secrets in batch
   */
  const encryptBatch = useCallback(
    async (
      secrets: Array<{
        id: string;
        name: string;
        username?: string;
        password: string;
        url?: string;
        notes?: string;
      }>
    ) => {
      if (!keyRef.current) {
        throw new Error('Vault is locked. Please unlock first.');
      }

      return encryptSecretsBatch(secrets, keyRef.current);
    },
    []
  );

  /**
   * Decrypt multiple secrets in batch
   */
  const decryptBatch = useCallback(
    async (
      encryptedSecrets: Array<{
        id: string;
        encryptedData: string;
        iv: string;
      }>
    ) => {
      if (!keyRef.current) {
        throw new Error('Vault is locked. Please unlock first.');
      }

      return decryptSecretsBatch(encryptedSecrets, keyRef.current);
    },
    []
  );

  return {
    encryptionKey,
    isUnlocked,
    initializeVault,
    unlock,
    lock,
    encrypt,
    decrypt,
    encryptBatch,
    decryptBatch,
  };
}
