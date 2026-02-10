import { PasswordGenerator } from '@/components/PasswordGenerator';
import { AppShell, PageHeader } from '@/components/layout';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PasswordGeneratorDemo() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <PageHeader
            title="Password Generator"
            description="Generate cryptographically secure passwords with custom options"
          />

          <div className="mt-8">
            <PasswordGenerator />
          </div>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-cyan-400">Security Features</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Uses <code className="text-cyan-400">crypto.getRandomValues()</code> for cryptographically secure randomness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Guarantees at least one character from each selected type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Can exclude ambiguous characters (0/O, 1/l/I) for better readability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Real-time strength calculation based on length and complexity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Integrated into secret creation for seamless workflow</span>
              </li>
            </ul>
          </div>

          {/* Usage Tip */}
          <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-sm text-cyan-300">
              💡 <strong>Tip:</strong> When creating or editing a secret, click the "Generate" button next to the password field to access the compact version of this generator.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
