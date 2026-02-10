'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVault } from '@/contexts/VaultContext';
import { LoadingSpinner } from '@/components/layout';

export default function Home() {
  const { hasVault, isAuthenticated, isLoading } = useVault();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If already authenticated, go to vault
    if (isAuthenticated) {
      router.replace('/vault');
      return;
    }

    // If has vault, go to login
    if (hasVault) {
      router.replace('/login');
      return;
    }

    // Otherwise, go to register
    router.replace('/register');
  }, [hasVault, isAuthenticated, isLoading, router]);

  // Show loading while checking vault status
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-slate-400">Loading NotoshaVault...</p>
      </div>
    </div>
  );
}
