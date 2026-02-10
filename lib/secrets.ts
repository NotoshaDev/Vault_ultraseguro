/**
 * Secrets Storage Utilities
 * Manages encrypted secrets in localStorage
 */

export interface SecretData {
  id: string;
  name: string;
  username?: string;
  password: string;
  url?: string;
  category: SecretCategory;
  notes?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedSecretData {
  id: string;
  encryptedData: string;
  iv: string;
  category: SecretCategory;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SecretCategory = 'login' | 'credit-card' | 'api-key' | 'note' | 'other';

const STORAGE_KEY = 'notosha_encrypted_secrets';

/**
 * Get all encrypted secrets from localStorage
 */
export function getEncryptedSecrets(): EncryptedSecretData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save encrypted secrets to localStorage
 */
export function saveEncryptedSecrets(secrets: EncryptedSecretData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(secrets));
}

/**
 * Add a new encrypted secret
 */
export function addEncryptedSecret(secret: EncryptedSecretData): void {
  const secrets = getEncryptedSecrets();
  secrets.push(secret);
  saveEncryptedSecrets(secrets);
}

/**
 * Update an existing encrypted secret
 */
export function updateEncryptedSecret(id: string, secret: EncryptedSecretData): void {
  const secrets = getEncryptedSecrets();
  const index = secrets.findIndex(s => s.id === id);
  
  if (index !== -1) {
    secrets[index] = secret;
    saveEncryptedSecrets(secrets);
  }
}

/**
 * Delete a secret by ID
 */
export function deleteEncryptedSecret(id: string): void {
  const secrets = getEncryptedSecrets();
  const filtered = secrets.filter(s => s.id !== id);
  saveEncryptedSecrets(filtered);
}

/**
 * Clear all secrets
 */
export function clearAllSecrets(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Toggle favorite status
 */
export function toggleSecretFavorite(id: string): void {
  const secrets = getEncryptedSecrets();
  const secret = secrets.find(s => s.id === id);
  
  if (secret) {
    secret.isFavorite = !secret.isFavorite;
    secret.updatedAt = new Date().toISOString();
    saveEncryptedSecrets(secrets);
  }
}

/**
 * Get category icon and color
 */
export function getCategoryInfo(category: SecretCategory): {
  label: string;
  color: string;
} {
  const info = {
    login: { label: 'Login', color: 'cyan' },
    'credit-card': { label: 'Card', color: 'emerald' },
    'api-key': { label: 'API Key', color: 'amber' },
    note: { label: 'Note', color: 'purple' },
    other: { label: 'Other', color: 'slate' },
  };
  
  return info[category] || info.other;
}
