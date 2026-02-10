/**
 * Password Generator Utilities
 * Secure password generation using Web Crypto API
 */

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: '0O1lI|`~', // Characters to exclude if excludeAmbiguous is true
};

/**
 * Generate a cryptographically secure random password
 */
export function generatePassword(options: PasswordOptions): string {
  // Build character set based on options
  let charset = '';
  
  if (options.uppercase) charset += CHAR_SETS.uppercase;
  if (options.lowercase) charset += CHAR_SETS.lowercase;
  if (options.numbers) charset += CHAR_SETS.numbers;
  if (options.symbols) charset += CHAR_SETS.symbols;

  // Must have at least one character type selected
  if (charset.length === 0) {
    charset = CHAR_SETS.lowercase + CHAR_SETS.numbers;
  }

  // Remove ambiguous characters if requested
  if (options.excludeAmbiguous) {
    charset = charset
      .split('')
      .filter(char => !CHAR_SETS.ambiguous.includes(char))
      .join('');
  }

  // Generate password using crypto.getRandomValues for security
  const password: string[] = [];
  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < options.length; i++) {
    const randomIndex = randomValues[i] % charset.length;
    password.push(charset[randomIndex]);
  }

  // Ensure at least one character from each selected type
  let result = password.join('');
  result = ensureRequiredChars(result, options, charset);

  return result;
}

/**
 * Ensure password contains at least one character from each selected type
 */
function ensureRequiredChars(
  password: string,
  options: PasswordOptions,
  charset: string
): string {
  const chars = password.split('');
  const required: Array<{ test: RegExp; chars: string }> = [];

  if (options.uppercase) required.push({ test: /[A-Z]/, chars: CHAR_SETS.uppercase });
  if (options.lowercase) required.push({ test: /[a-z]/, chars: CHAR_SETS.lowercase });
  if (options.numbers) required.push({ test: /[0-9]/, chars: CHAR_SETS.numbers });
  if (options.symbols) required.push({ test: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/, chars: CHAR_SETS.symbols });

  let modified = false;
  for (const req of required) {
    if (!req.test.test(password)) {
      // Replace a random character with one from the required set
      const randomIndex = Math.floor(Math.random() * chars.length);
      const charSet = options.excludeAmbiguous
        ? req.chars.split('').filter(c => !CHAR_SETS.ambiguous.includes(c)).join('')
        : req.chars;
      const randomChar = charSet[Math.floor(Math.random() * charSet.length)];
      chars[randomIndex] = randomChar;
      modified = true;
    }
  }

  return modified ? chars.join('') : password;
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) return 'weak';

  let score = 0;

  // Length score (0-40 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  // Character variety (0-40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) score += 10;

  // Complexity bonus (0-20 points)
  const uniqueChars = new Set(password.split('')).size;
  const uniqueRatio = uniqueChars / password.length;
  score += Math.floor(uniqueRatio * 20);

  // Determine strength based on score
  if (score < 30) return 'weak';
  if (score < 50) return 'medium';
  if (score < 70) return 'strong';
  return 'very-strong';
}

/**
 * Get strength details for UI display
 */
export function getPasswordStrengthInfo(strength: PasswordStrength): {
  label: string;
  color: string;
  barWidth: string;
} {
  switch (strength) {
    case 'weak':
      return { label: 'Weak', color: 'text-red-400', barWidth: 'w-1/4' };
    case 'medium':
      return { label: 'Medium', color: 'text-amber-400', barWidth: 'w-2/4' };
    case 'strong':
      return { label: 'Strong', color: 'text-emerald-400', barWidth: 'w-3/4' };
    case 'very-strong':
      return { label: 'Very Strong', color: 'text-cyan-400', barWidth: 'w-full' };
  }
}

/**
 * Default password generation options
 */
export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
};
