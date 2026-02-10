/**
 * Security Analyzer
 * Analyzes password security and provides recommendations
 */

import { type SecretData } from './secrets';
import { calculatePasswordStrength, type PasswordStrength } from './password-generator';

export interface SecurityIssue {
  id: string;
  type: 'weak' | 'reused' | 'old';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  secretIds: string[];
}

export interface SecurityScore {
  overall: number; // 0-100
  weakPasswords: number;
  reusedPasswords: number;
  oldPasswords: number;
  strongPasswords: number;
}

export interface SecurityReport {
  score: SecurityScore;
  issues: SecurityIssue[];
  recommendations: string[];
}

/**
 * Analyze all secrets and generate security report
 */
export function analyzeSecrets(secrets: SecretData[]): SecurityReport {
  const issues: SecurityIssue[] = [];
  const passwordMap = new Map<string, string[]>(); // password -> secret IDs
  const now = Date.now();
  const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);
  
  let weakCount = 0;
  let reusedCount = 0;
  let oldCount = 0;
  let strongCount = 0;

  // First pass: categorize passwords and detect duplicates
  secrets.forEach(secret => {
    const strength = calculatePasswordStrength(secret.password);
    
    // Track password reuse
    if (!passwordMap.has(secret.password)) {
      passwordMap.set(secret.password, []);
    }
    passwordMap.get(secret.password)!.push(secret.id);

    // Check for weak passwords
    if (strength === 'weak' || strength === 'medium') {
      weakCount++;
    } else {
      strongCount++;
    }

    // Check for old passwords (older than 6 months)
    const updatedAt = new Date(secret.updatedAt).getTime();
    if (updatedAt < sixMonthsAgo) {
      oldCount++;
    }
  });

  // Second pass: generate issues
  
  // Weak password issues
  secrets.forEach(secret => {
    const strength = calculatePasswordStrength(secret.password);
    
    if (strength === 'weak' || strength === 'medium') {
      issues.push({
        id: `weak-${secret.id}`,
        type: 'weak',
        severity: strength === 'weak' ? 'critical' : 'high',
        title: `Weak password for "${secret.name}"`,
        description: `This password is ${strength}. Consider using a stronger password with more characters and variety.`,
        secretIds: [secret.id],
      });
    }
  });

  // Reused password issues
  passwordMap.forEach((secretIds, password) => {
    if (secretIds.length > 1) {
      reusedCount += secretIds.length;
      const names = secretIds
        .map(id => secrets.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join('", "');
      
      issues.push({
        id: `reused-${password.substring(0, 8)}`,
        type: 'reused',
        severity: 'high',
        title: `Password reused across ${secretIds.length} accounts`,
        description: `The same password is used for: "${names}". Each account should have a unique password.`,
        secretIds,
      });
    }
  });

  // Old password issues
  secrets.forEach(secret => {
    const updatedAt = new Date(secret.updatedAt).getTime();
    if (updatedAt < sixMonthsAgo) {
      const monthsOld = Math.floor((now - updatedAt) / (30 * 24 * 60 * 60 * 1000));
      issues.push({
        id: `old-${secret.id}`,
        type: 'old',
        severity: monthsOld > 12 ? 'medium' : 'low',
        title: `Password for "${secret.name}" is ${monthsOld} months old`,
        description: `Consider updating this password. It hasn't been changed in ${monthsOld} months.`,
        secretIds: [secret.id],
      });
    }
  });

  // Calculate security score
  const totalSecrets = secrets.length || 1;
  const score: SecurityScore = {
    overall: calculateOverallScore({
      total: totalSecrets,
      weak: weakCount,
      reused: reusedCount,
      old: oldCount,
      strong: strongCount,
    }),
    weakPasswords: weakCount,
    reusedPasswords: reusedCount,
    oldPasswords: oldCount,
    strongPasswords: strongCount,
  };

  // Generate recommendations
  const recommendations = generateRecommendations(score, issues, totalSecrets);

  return {
    score,
    issues: issues.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    recommendations,
  };
}

/**
 * Calculate overall security score (0-100)
 */
function calculateOverallScore(data: {
  total: number;
  weak: number;
  reused: number;
  old: number;
  strong: number;
}): number {
  let score = 100;

  // Deduct for weak passwords (heavy penalty)
  score -= (data.weak / data.total) * 40;

  // Deduct for reused passwords (heavy penalty)
  score -= (data.reused / data.total) * 30;

  // Deduct for old passwords (light penalty)
  score -= (data.old / data.total) * 15;

  // Bonus for having many strong passwords
  if (data.strong >= data.total * 0.8) {
    score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate contextual recommendations
 */
function generateRecommendations(
  score: SecurityScore,
  issues: SecurityIssue[],
  totalSecrets: number
): string[] {
  const recommendations: string[] = [];

  if (totalSecrets === 0) {
    recommendations.push('Add your first secret to start tracking security.');
    return recommendations;
  }

  // Weak passwords
  if (score.weakPasswords > 0) {
    recommendations.push(
      `Update ${score.weakPasswords} weak password${score.weakPasswords > 1 ? 's' : ''} to improve security. Use the password generator to create strong ones.`
    );
  }

  // Reused passwords
  if (score.reusedPasswords > 0) {
    recommendations.push(
      `Replace ${score.reusedPasswords} reused password${score.reusedPasswords > 1 ? 's' : ''} with unique ones. Password reuse is a major security risk.`
    );
  }

  // Old passwords
  if (score.oldPasswords > 0) {
    recommendations.push(
      `Consider updating ${score.oldPasswords} password${score.oldPasswords > 1 ? 's' : ''} that haven't been changed in over 6 months.`
    );
  }

  // All good
  if (issues.length === 0) {
    recommendations.push('Excellent! All your passwords are strong and unique. Keep up the good security practices.');
  }

  // General best practices
  if (score.overall < 80) {
    recommendations.push('Enable two-factor authentication (2FA) on critical accounts for an extra layer of security.');
    recommendations.push('Review your security regularly and update passwords every 3-6 months.');
  }

  return recommendations;
}

/**
 * Get color and label for security score
 */
export function getScoreInfo(score: number): {
  label: string;
  color: string;
  variant: 'danger' | 'warning' | 'success';
  badgeVariant: 'destructive' | 'warning' | 'success';
} {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: 'text-emerald-400',
      variant: 'success',
      badgeVariant: 'success',
    };
  } else if (score >= 60) {
    return {
      label: 'Good',
      color: 'text-cyan-400',
      variant: 'success',
      badgeVariant: 'success',
    };
  } else if (score >= 40) {
    return {
      label: 'Fair',
      color: 'text-amber-400',
      variant: 'warning',
      badgeVariant: 'warning',
    };
  } else {
    return {
      label: 'Poor',
      color: 'text-red-400',
      variant: 'danger',
      badgeVariant: 'destructive',
    };
  }
}

/**
 * Get icon and color for issue severity
 */
export function getSeverityInfo(severity: SecurityIssue['severity']): {
  icon: string;
  color: string;
  bgColor: string;
} {
  switch (severity) {
    case 'critical':
      return {
        icon: '🚨',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
      };
    case 'high':
      return {
        icon: '⚠️',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
      };
    case 'medium':
      return {
        icon: '⚡',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
      };
    case 'low':
      return {
        icon: 'ℹ️',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
      };
  }
}
