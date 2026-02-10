'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useVault } from '@/contexts/VaultContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, Mail, Shield, Key } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useVault();
  
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace('/vault');
    }
  }, [mounted, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !masterPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (masterPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (masterPassword.length < 8) {
      setError('Master password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, masterPassword);

      if (result.success) {
        // Successful registration - redirect will happen via useEffect
        // when isAuthenticated becomes true
      } else {
        setError(result.error || 'Failed to create vault');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg mb-4 glow-cyan">
            <Shield className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Create Your Vault
          </h1>
          <p className="text-slate-400">
            Zero-knowledge password manager
          </p>
        </motion.div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
        <Card className="glow-cyan">
          <CardHeader>
            <CardTitle>Initialize Vault</CardTitle>
            <CardDescription>
              Your master password is the only key to your vault. Make it strong and memorable.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" required>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4" />}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="masterPassword" required>Master Password</Label>
                <Input
                  id="masterPassword"
                  type="password"
                  placeholder="••••••••••••"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  icon={<Key className="h-4 w-4" />}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <p className="text-xs text-slate-500">
                  Minimum 8 characters. This cannot be recovered if lost.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>Confirm Master Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              <Alert variant="warning">
                <AlertDescription className="text-xs">
                  <strong>Important:</strong> Your master password cannot be recovered. Make sure to remember it or store it securely.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="glow"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Vault...' : 'Create Vault'}
              </Button>

              {/* Always show login link for manual access */}
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/login')}
                disabled={isLoading}
              >
                Already have a vault? Login
              </Button>
            </CardFooter>
          </form>
        </Card>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 space-y-2 text-xs text-slate-500 text-center"
        >
          <p> All encryption happens locally in your browser</p>
          <p> Your master password never leaves your device</p>
          <p> AES-256-GCM + PBKDF2 (100,000 iterations)</p>
        </motion.div>
      </div>
    </div>
  );
}
