'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { SecurityDashboard } from '@/components/SecurityDashboard';

export default function SecurityPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Security Dashboard</h1>
          <p className="text-sm text-slate-400">
            Monitor your password health and get recommendations to improve your security.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/vault">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Vault
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>

      <SecurityDashboard />
    </div>
  );
}
