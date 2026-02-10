// Core types for NotoshaVault

export interface Secret {
  id: string;
  name: string;
  username?: string;
  password: string;
  url?: string;
  category: SecretCategory;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
}

export type SecretCategory = 
  | "login"
  | "credit-card"
  | "api-key"
  | "note"
  | "other";

export interface EncryptedSecret {
  id: string;
  encryptedData: string;
  iv: string;
  salt: string;
}

export interface VaultState {
  isLocked: boolean;
  secrets: Secret[];
  lastActivity: Date;
  securityScore: number;
}

export interface SecurityAnalysis {
  totalSecrets: number;
  weakPasswords: number;
  reusedPasswords: number;
  oldPasswords: number;
  securityScore: number;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}
