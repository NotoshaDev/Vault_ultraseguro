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
import { Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, hasVault, userEmail, isAuthenticated } = useVault();
  
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated (only after mount)
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace('/vault');
    }
  }, [mounted, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !masterPassword) {
      setError('Please enter your email and master password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, masterPassword);

      if (result.success) {
        // Successful login - redirect will happen via useEffect
        // No need to manually call router.push here
      } else {
        setError(result.error || 'Failed to unlock vault');
        setMasterPassword(''); // Clear password on error
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
      setEmail('');
      setMasterPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  // Show the login page
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
            NotoshaVault
          </h1>
          <p className="text-slate-400">
            Welcome back,
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
        <Card className="glow-cyan">
          <CardHeader>
            <CardTitle>Unlock Your Vault</CardTitle>
            <CardDescription>
              Enter your master password to access your secrets
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
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
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
                  icon={<Lock className="h-4 w-4" />}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Alert variant="info" showIcon={false}>
                <AlertDescription className="text-xs">
                  Your vault will auto-lock after 5 minutes of inactivity
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
                {isLoading ? 'Unlocking...' : 'Unlock Vault'}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors block w-full"
                  onClick={() => {
                    alert('Master password cannot be recovered. You will need to reset your vault and lose all data.');
                  }}
                >
                  Forgot your master password?
                </button>
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors block w-full"
                  onClick={() => router.push('/register')}
                >
                  Don't have an account? Register here
                </button>
              </div>
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
          <p> Zero-knowledge encryption</p>
          <p> Your data is encrypted locally</p>
        </motion.div>
      </div>
    </div>
  );
}
