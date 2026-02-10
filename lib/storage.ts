/**
 * Local Storage Utilities
 * Manages secure storage of vault metadata (NOT secrets)
 */

const STORAGE_KEYS = {
  VAULT_EXISTS: 'notosha_vault_exists',
  VAULT_SALT: 'notosha_vault_salt',
  VAULT_AUTH_HASH: 'notosha_vault_auth_hash',
  USER_EMAIL: 'notosha_user_email',
  LAST_UNLOCK: 'notosha_last_unlock',
} as const;

export interface VaultMetadata {
  salt: string;
  authHash: string;
  email: string;
}

/**
 * Check if a vault exists in localStorage
 */
export function vaultExists(): boolean {
  return localStorage.getItem(STORAGE_KEYS.VAULT_EXISTS) === 'true';
}

/**
 * Save vault metadata to localStorage
 */
export function saveVaultMetadata(metadata: VaultMetadata): void {
  localStorage.setItem(STORAGE_KEYS.VAULT_EXISTS, 'true');
  localStorage.setItem(STORAGE_KEYS.VAULT_SALT, metadata.salt);
  localStorage.setItem(STORAGE_KEYS.VAULT_AUTH_HASH, metadata.authHash);
  localStorage.setItem(STORAGE_KEYS.USER_EMAIL, metadata.email);
  localStorage.setItem(STORAGE_KEYS.LAST_UNLOCK, Date.now().toString());
}

/**
 * Get vault metadata from localStorage
 */
export function getVaultMetadata(): VaultMetadata | null {
  if (!vaultExists()) {
    return null;
  }

  const salt = localStorage.getItem(STORAGE_KEYS.VAULT_SALT);
  const authHash = localStorage.getItem(STORAGE_KEYS.VAULT_AUTH_HASH);
  const email = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);

  if (!salt || !authHash || !email) {
    return null;
  }

  return { salt, authHash, email };
}

/**
 * Clear all vault data from localStorage
 */
export function clearVaultData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Clear sensitive vault data but keep email for vault existence check
 */
export function clearSensitiveData(): void {
  localStorage.removeItem(STORAGE_KEYS.VAULT_EXISTS);
  localStorage.removeItem(STORAGE_KEYS.VAULT_SALT);
  localStorage.removeItem(STORAGE_KEYS.VAULT_AUTH_HASH);
  localStorage.removeItem(STORAGE_KEYS.LAST_UNLOCK);
  // Keep USER_EMAIL so we can check if vault exists in database
}

/**
 * Update last unlock timestamp
 */
export function updateLastUnlock(): void {
  localStorage.setItem(STORAGE_KEYS.LAST_UNLOCK, Date.now().toString());
}

/**
 * Get last unlock timestamp
 */
export function getLastUnlock(): number | null {
  const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_UNLOCK);
  return timestamp ? parseInt(timestamp, 10) : null;
}

/**
 * Get user email
 */
export function getUserEmail(): string | null {
  return localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
}
