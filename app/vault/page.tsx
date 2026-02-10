'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVault } from '@/contexts/VaultContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, LogOut, Clock, Key, TrendingUp, Eye } from 'lucide-react';
import { LoadingSpinner } from '@/components/layout';
import { SecretsList } from '@/components/secrets/SecretsList';

export default function VaultPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userEmail, lock, logout } = useVault();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-400">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      
      {/* Scanline effect */}
      <div className="scanline fixed inset-0 pointer-events-none opacity-10" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    NotoshaVault
                  </h1>
                </div>
                <Badge variant="success">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-1.5"></div>
                  Unlocked
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <p className="text-sm text-slate-300">{userEmail}</p>
                  <p className="text-xs text-slate-500">Vault Owner</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={lock}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Lock
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="flex gap-3 mb-6">
              <Link href="/vault">
                <Button variant="outline" size="sm" className="gap-2">
                  <Key className="h-4 w-4" />
                  All Secrets
                </Button>
              </Link>
              <Link href="/vault/security">
                <Button variant="outline" size="sm" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Security Dashboard
                </Button>
              </Link>
              <Link href="/encryption-proof">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Encryption Proof
                </Button>
              </Link>
            </div>

            {/* Welcome Card */}
            <Card className="mb-8 glow-cyan">
              <CardHeader>
                <CardTitle>Welcome to Your Vault</CardTitle>
                <CardDescription>
                  Your vault is unlocked and ready. All your secrets are encrypted with AES-256-GCM.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>Auto-lock is active. Vault will lock after 5 minutes of inactivity.</span>
                </div>
              </CardContent>
            </Card>

            {/* Secrets List */}
            <SecretsList />
          </div>
        </main>
      </div>
    </div>
  );
}
