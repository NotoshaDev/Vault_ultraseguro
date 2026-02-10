'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useCrypto } from '@/hooks/useCrypto';
import { useAutoLock } from '@/hooks/useAutoLock';
import {
  vaultExistsInDB,
  createVault,
  getVaultByEmail,
  updateLastUnlock as updateLastUnlockDB,
} from '@/lib/database/vault.service';
import {
  vaultExists as vaultExistsLocal,
  saveVaultMetadata,
  getVaultMetadata,
  clearSensitiveData,
  updateLastUnlock,
  getUserEmail,
  type VaultMetadata,
} from '@/lib/storage';

interface VaultContextType {
  // State
  isAuthenticated: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  userEmail: string | null;
  vaultId: string | null;
  
  // Auth actions
  register: (email: string, masterPassword: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, masterPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  lock: () => void;
  
  // Vault info
  hasVault: boolean;
  
  // Crypto access
  encryptionKey: CryptoKey | null;
  crypto: ReturnType<typeof useCrypto>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [vaultId, setVaultId] = useState<string | null>(null);
  const [hasVault, setHasVault] = useState(false);
  
  const crypto = useCrypto();

  // Auto-lock setup
  useAutoLock({
    onLock: () => {
      crypto.lock();
      setIsAuthenticated(false);
    },
    enabled: crypto.isUnlocked,
  });

  // Check for existing vault on mount
  useEffect(() => {
    const checkVault = async () => {
      // Check localStorage first for email
      const localEmail = getUserEmail();
      
      if (localEmail) {
        setUserEmail(localEmail);
        // Check if vault exists in database
        const exists = await vaultExistsInDB(localEmail);
        setHasVault(exists);
      } else {
        // Fallback to local check
        const exists = vaultExistsLocal();
        setHasVault(exists);
        if (exists) {
          const email = getUserEmail();
          setUserEmail(email);
        }
      }
      
      setIsLoading(false);
    };

    checkVault();
  }, []);

  /**
   * Register new vault
   */
  const register = useCallback(
    async (email: string, masterPassword: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsLoading(true);

        // Check if vault already exists in database
        const exists = await vaultExistsInDB(email);
        if (exists) {
          return { success: false, error: 'A vault with this email already exists' };
        }

        // Validate inputs
        if (!email || !masterPassword) {
          return { success: false, error: 'Email and password are required' };
        }

        if (masterPassword.length < 8) {
          return { success: false, error: 'Password must be at least 8 characters' };
        }

        // Initialize vault with master password
        const { authHash, salt } = await crypto.initializeVault(masterPassword);

        // Save to database
        const result = await createVault({
          email,
          salt,
          authHash,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        // Also save to localStorage for quick access
        const metadata: VaultMetadata = {
          salt,
          authHash,
          email,
        };
        saveVaultMetadata(metadata);

        // Update state
        setHasVault(true);
        setUserEmail(email);
        setVaultId(result.vaultId || null);
        setIsAuthenticated(true);

        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Failed to create vault' };
      } finally {
        setIsLoading(false);
      }
    },
    [crypto]
  );

  /**
   * Login to existing vault
   */
  const login = useCallback(
    async (email: string, masterPassword: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsLoading(true);

        // Validate inputs
        if (!email || !masterPassword) {
          return { success: false, error: 'Email and password are required' };
        }

        // Try to get vault from database
        const vaultData = await getVaultByEmail(email);
        
        if (!vaultData) {
          // Fallback to local metadata
          const metadata = getVaultMetadata();
          if (!metadata) {
            return { success: false, error: 'No vault found' };
          }

          // Attempt to unlock vault with local data
          const unlocked = await crypto.unlock(
            masterPassword,
            metadata.salt,
            metadata.authHash
          );

          if (!unlocked) {
            return { success: false, error: 'Invalid master password' };
          }

          // Update state
          setIsAuthenticated(true);
          setUserEmail(metadata.email);
          setVaultId(null);
          updateLastUnlock();

          return { success: true };
        }

        // Attempt to unlock vault with database data
        const unlocked = await crypto.unlock(
          masterPassword,
          vaultData.salt,
          vaultData.auth_hash
        );

        if (!unlocked) {
          return { success: false, error: 'Invalid master password' };
        }

        // Save vault metadata to localStorage for caching
        const metadata: VaultMetadata = {
          salt: vaultData.salt,
          authHash: vaultData.auth_hash,
          email: vaultData.email,
        };
        saveVaultMetadata(metadata);

        // Update state
        setIsAuthenticated(true);
        setUserEmail(vaultData.email);
        setVaultId(vaultData.id);
        
        // Update last unlock in database
        await updateLastUnlockDB(vaultData.id);
        
        // Also update localStorage timestamp
        updateLastUnlock();

        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Failed to unlock vault' };
      } finally {
        setIsLoading(false);
      }
    },
    [crypto]
  );

  /**
   * Logout and clear vault data
   */
  const logout = useCallback(() => {
    crypto.lock();
    clearSensitiveData(); // Clear sensitive data but keep email
    setIsAuthenticated(false);
    // Don't set hasVault to false - let it re-check on next mount
    // setUserEmail stays as-is to allow checking vault existence
    setVaultId(null);
  }, [crypto]);

  /**
   * Lock vault (keep data, just lock)
   */
  const lock = useCallback(() => {
    crypto.lock();
    setIsAuthenticated(false);
  }, [crypto]);

  const value: VaultContextType = {
    isAuthenticated,
    isUnlocked: crypto.isUnlocked,
    isLoading,
    userEmail,
    vaultId,
    register,
    login,
    logout,
    lock,
    hasVault,
    encryptionKey: crypto.encryptionKey,
    crypto,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

/**
 * Hook to use vault context
 */
export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
