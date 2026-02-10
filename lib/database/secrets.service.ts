/**
 * Secrets Service - Database operations for encrypted secrets
 * All secrets are encrypted client-side before storage (Zero-Knowledge)
 */

import { supabase } from '../supabase/client';
import type { Secret } from '../supabase/types';

export interface EncryptedSecretInput {
  vaultId: string;
  encryptedData: string;
  iv: string;
  category?: string;
  isFavorite?: boolean;
}

export interface SecretUpdate {
  encryptedData?: string;
  iv?: string;
  category?: string;
  isFavorite?: boolean;
}

/**
 * Get all secrets for a vault
 */
export async function getSecretsByVaultId(vaultId: string): Promise<Secret[]> {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching secrets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSecretsByVaultId:', error);
    return [];
  }
}

/**
 * Create a new encrypted secret
 */
export async function createSecret(secretData: EncryptedSecretInput): Promise<{ success: boolean; secretId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .insert({
        vault_id: secretData.vaultId,
        encrypted_data: secretData.encryptedData,
        iv: secretData.iv,
        category: secretData.category || 'login',
        is_favorite: secretData.isFavorite || false,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, secretId: data.id };
  } catch (error) {
    console.error('Error creating secret:', error);
    return { success: false, error: 'Failed to create secret' };
  }
}

/**
 * Update an existing secret
 */
export async function updateSecret(
  secretId: string,
  vaultId: string,
  updates: SecretUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    // Build update object with only defined properties
    const updateData: Record<string, any> = {};
    if (updates.encryptedData !== undefined) updateData.encrypted_data = updates.encryptedData;
    if (updates.iv !== undefined) updateData.iv = updates.iv;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

    const { error } = await supabase
      .from('secrets')
      .update(updateData)
      .eq('id', secretId)
      .eq('vault_id', vaultId); // Security: ensure secret belongs to this vault

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating secret:', error);
    return { success: false, error: 'Failed to update secret' };
  }
}

/**
 * Toggle favorite status
 */
export async function toggleSecretFavorite(
  secretId: string,
  vaultId: string,
  isFavorite: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('secrets')
      .update({ is_favorite: isFavorite })
      .eq('id', secretId)
      .eq('vault_id', vaultId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, error: 'Failed to toggle favorite' };
  }
}

/**
 * Delete a secret
 */
export async function deleteSecret(
  secretId: string,
  vaultId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('secrets')
      .delete()
      .eq('id', secretId)
      .eq('vault_id', vaultId); // Security: ensure secret belongs to this vault

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting secret:', error);
    return { success: false, error: 'Failed to delete secret' };
  }
}

/**
 * Get secrets by category
 */
export async function getSecretsByCategory(
  vaultId: string,
  category: string
): Promise<Secret[]> {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('vault_id', vaultId)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching secrets by category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSecretsByCategory:', error);
    return [];
  }
}

/**
 * Get favorite secrets
 */
export async function getFavoriteSecrets(vaultId: string): Promise<Secret[]> {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('vault_id', vaultId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorite secrets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFavoriteSecrets:', error);
    return [];
  }
}

/**
 * Search secrets (searches encrypted data - won't return meaningful results)
 * This is a placeholder for future client-side search after decryption
 */
export async function searchSecrets(
  vaultId: string,
  searchTerm: string
): Promise<Secret[]> {
  // Note: Since data is encrypted, we can't do server-side search
  // This function returns all secrets for client-side filtering after decryption
  return getSecretsByVaultId(vaultId);
}

/**
 * Get secret count by vault
 */
export async function getSecretCount(vaultId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('secrets')
      .select('*', { count: 'exact', head: true })
      .eq('vault_id', vaultId);

    if (error) {
      console.error('Error getting secret count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getSecretCount:', error);
    return 0;
  }
}
