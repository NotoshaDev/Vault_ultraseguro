/**
 * Vault Service - Database operations for vault metadata
 * Handles authentication and vault management with Supabase
 */

import { supabase } from '../supabase/client';
import type { Vault } from '../supabase/types';

export interface VaultData {
  email: string;
  salt: string;
  authHash: string;
}

/**
 * Check if a vault exists for a given email
 */
export async function vaultExistsInDB(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('vaults')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking vault existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in vaultExistsInDB:', error);
    return false;
  }
}

/**
 * Create a new vault in the database
 */
export async function createVault(vaultData: VaultData): Promise<{ success: boolean; vaultId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('vaults')
      .insert({
        email: vaultData.email.toLowerCase(),
        salt: vaultData.salt,
        auth_hash: vaultData.authHash,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: false, error: 'A vault with this email already exists' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, vaultId: data.id };
  } catch (error) {
    console.error('Error creating vault:', error);
    return { success: false, error: 'Failed to create vault' };
  }
}

/**
 * Get vault metadata by email
 */
export async function getVaultByEmail(email: string): Promise<Vault | null> {
  try {
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      console.error('Error fetching vault:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getVaultByEmail:', error);
    return null;
  }
}

/**
 * Update last unlock timestamp
 */
export async function updateLastUnlock(vaultId: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('vaults')
      .update({ last_unlock: now })
      .eq('id', vaultId);

    if (error) {
      console.error('Error updating last unlock:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateLastUnlock:', error);
    return false;
  }
}

/**
 * Delete vault and all associated secrets
 */
export async function deleteVault(vaultId: string): Promise<boolean> {
  try {
    // Cascade delete will automatically remove associated secrets
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', vaultId);

    if (error) {
      console.error('Error deleting vault:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteVault:', error);
    return false;
  }
}
