/**
 * Supabase Database Types
 * Generated from database schema
 */

export interface Database {
  public: {
    Tables: {
      vaults: {
        Row: {
          id: string;
          email: string;
          salt: string;
          auth_hash: string;
          created_at: string;
          last_unlock: string;
        };
        Insert: {
          id?: string;
          email: string;
          salt: string;
          auth_hash: string;
          created_at?: string;
          last_unlock?: string;
        };
        Update: {
          id?: string;
          email?: string;
          salt?: string;
          auth_hash?: string;
          created_at?: string;
          last_unlock?: string;
        };
        Relationships: [];
      };
      secrets: {
        Row: {
          id: string;
          vault_id: string;
          encrypted_data: string;
          iv: string;
          category: string;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vault_id: string;
          encrypted_data: string;
          iv: string;
          category?: string;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vault_id?: string;
          encrypted_data?: string;
          iv?: string;
          category?: string;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'secrets_vault_id_fkey';
            columns: ['vault_id'];
            referencedRelation: 'vaults';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type Vault = Database['public']['Tables']['vaults']['Row'];
export type Secret = Database['public']['Tables']['secrets']['Row'];
