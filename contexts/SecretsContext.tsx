'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useVault } from './VaultContext';
import {
  getEncryptedSecrets,
  addEncryptedSecret,
  updateEncryptedSecret,
  deleteEncryptedSecret,
  toggleSecretFavorite as toggleLocalFavorite,
  type SecretData,
  type EncryptedSecretData,
  type SecretCategory,
} from '@/lib/secrets';
import {
  getSecretsByVaultId,
  createSecret as createSecretInDB,
  updateSecret as updateSecretInDB,
  deleteSecret as deleteSecretFromDB,
  toggleSecretFavorite as toggleSecretFavoriteInDB,
} from '@/lib/database/secrets.service';

interface SecretsContextType {
  secrets: SecretData[];
  isLoading: boolean;
  addSecret: (secret: Omit<SecretData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSecret: (id: string, secret: Omit<SecretData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteSecret: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  refreshSecrets: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: SecretCategory | 'all';
  setCategoryFilter: (category: SecretCategory | 'all') => void;
  filteredSecrets: SecretData[];
}

const SecretsContext = createContext<SecretsContextType | undefined>(undefined);

export function SecretsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, encryptionKey, vaultId, crypto } = useVault();
  
  const [secrets, setSecrets] = useState<SecretData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SecretCategory | 'all'>('all');

  /**
   * Load and decrypt all secrets
   */
  const refreshSecrets = useCallback(async () => {
    if (!isAuthenticated || !encryptionKey) {
      setSecrets([]);
      return;
    }

    setIsLoading(true);

    try {
      let encryptedSecrets: any[] = [];

      // Try to load from database first if vaultId exists
      if (vaultId) {
        const dbSecrets = await getSecretsByVaultId(vaultId);
        // Map database secrets to EncryptedSecretData format
        encryptedSecrets = dbSecrets.map((s) => ({
          id: s.id,
          encryptedData: s.encrypted_data,
          iv: s.iv,
          category: s.category as SecretCategory,
          isFavorite: s.is_favorite,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        }));
      } else {
        // Fallback to localStorage
        encryptedSecrets = getEncryptedSecrets();
      }
      
      if (encryptedSecrets.length === 0) {
        setSecrets([]);
        setIsLoading(false);
        return;
      }

      // Decrypt all secrets
      const decryptedSecrets = await Promise.all(
        encryptedSecrets.map(async (encrypted) => {
          try {
            const decrypted = await crypto.decrypt(
              encrypted.encryptedData,
              encrypted.iv
            );

            return {
              id: encrypted.id,
              ...decrypted,
              category: encrypted.category,
              isFavorite: encrypted.isFavorite,
              createdAt: encrypted.createdAt,
              updatedAt: encrypted.updatedAt,
            } as SecretData;
          } catch (error) {
            // Silently skip corrupted secrets (from old keys or bad data)
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              console.warn('Skipping corrupted secret:', encrypted.id);
            }
            return null;
          }
        })
      );

      // Filter out failed decryptions
      const validSecrets = decryptedSecrets.filter((s): s is SecretData => s !== null);
      setSecrets(validSecrets);
    } catch (error) {
      console.error('Failed to load secrets:', error);
      setSecrets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, encryptionKey, vaultId, crypto.decrypt]);

  /**
   * Load secrets when vault is unlocked
   */
  useEffect(() => {
    refreshSecrets();
  }, [isAuthenticated, encryptionKey]); // Removed refreshSecrets from deps to avoid infinite loop

  /**
   * Add a new secret
   */
  const addSecret = useCallback(
    async (secret: Omit<SecretData, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!encryptionKey) {
        throw new Error('Vault is locked');
      }

      // Encrypt the secret data
      const dataToEncrypt = {
        name: secret.name,
        username: secret.username,
        password: secret.password,
        url: secret.url,
        notes: secret.notes,
      };

      const { encryptedData, iv } = await crypto.encrypt(dataToEncrypt);

      // Save to database if vaultId exists, otherwise to localStorage
      if (vaultId) {
        const result = await createSecretInDB({
          vaultId,
          encryptedData,
          iv,
          category: secret.category,
          isFavorite: secret.isFavorite,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to save secret');
        }
      } else {
        // Fallback to localStorage
        const now = new Date().toISOString();
        const newSecret: EncryptedSecretData = {
          id: `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          encryptedData,
          iv,
          category: secret.category,
          isFavorite: secret.isFavorite,
          createdAt: now,
          updatedAt: now,
        };
        addEncryptedSecret(newSecret);
      }
      
      // Reload secrets
      await refreshSecrets();
    },
    [encryptionKey, vaultId, crypto.encrypt, refreshSecrets]
  );

  /**
   * Update an existing secret
   */
  const updateSecret = useCallback(
    async (id: string, secret: Omit<SecretData, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!encryptionKey) {
        throw new Error('Vault is locked');
      }

      // Encrypt the updated secret data
      const dataToEncrypt = {
        name: secret.name,
        username: secret.username,
        password: secret.password,
        url: secret.url,
        notes: secret.notes,
      };

      const { encryptedData, iv } = await crypto.encrypt(dataToEncrypt);

      // Update in database if vaultId exists, otherwise in localStorage
      if (vaultId) {
        const result = await updateSecretInDB(id, vaultId, {
          encryptedData,
          iv,
          category: secret.category,
          isFavorite: secret.isFavorite,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to update secret');
        }
      } else {
        // Fallback to localStorage
        const existing = getEncryptedSecrets().find(s => s.id === id);
        if (!existing) {
          throw new Error('Secret not found');
        }

        const updatedSecret: EncryptedSecretData = {
          id,
          encryptedData,
          iv,
          category: secret.category,
          isFavorite: secret.isFavorite,
          createdAt: existing.createdAt,
          updatedAt: new Date().toISOString(),
        };

        updateEncryptedSecret(id, updatedSecret);
      }
      
      // Reload secrets
      await refreshSecrets();
    },
    [encryptionKey, vaultId, crypto.encrypt, refreshSecrets]
  );

  /**
   * Delete a secret
   */
  const deleteSecret = useCallback(
    async (id: string) => {
      // Delete from database if vaultId exists, otherwise from localStorage
      if (vaultId) {
        const result = await deleteSecretFromDB(id, vaultId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete secret');
        }
      } else {
        // Fallback to localStorage
        deleteEncryptedSecret(id);
      }
      
      // Reload secrets
      await refreshSecrets();
    },
    [vaultId, refreshSecrets]
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    async (id: string) => {
      const existing = secrets.find(s => s.id === id);
      if (!existing) return;

      const newFavoriteStatus = !existing.isFavorite;

      // Update in database if vaultId exists, otherwise in localStorage
      if (vaultId) {
        const result = await toggleSecretFavoriteInDB(id, vaultId, newFavoriteStatus);
        if (!result.success) {
          throw new Error(result.error || 'Failed to toggle favorite');
        }
      } else {
        // Fallback to localStorage
        toggleLocalFavorite(id);
      }
      
      // Reload secrets
      await refreshSecrets();
    },
    [vaultId, secrets, refreshSecrets]
  );

  /**
   * Filter secrets based on search and category
   */
  const filteredSecrets = secrets.filter((secret) => {
    // Category filter
    if (categoryFilter !== 'all' && secret.category !== categoryFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        secret.name.toLowerCase().includes(query) ||
        secret.username?.toLowerCase().includes(query) ||
        secret.url?.toLowerCase().includes(query) ||
        secret.notes?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const value: SecretsContextType = {
    secrets,
    isLoading,
    addSecret,
    updateSecret,
    deleteSecret,
    toggleFavorite,
    refreshSecrets,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    filteredSecrets,
  };

  return <SecretsContext.Provider value={value}>{children}</SecretsContext.Provider>;
}

export function useSecrets() {
  const context = useContext(SecretsContext);
  if (context === undefined) {
    throw new Error('useSecrets must be used within a SecretsProvider');
  }
  return context;
}
