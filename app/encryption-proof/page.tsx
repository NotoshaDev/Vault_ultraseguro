'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Shield, Lock, Eye, Code } from 'lucide-react';
import { useVault } from '@/contexts/VaultContext';
import { useSecrets } from '@/contexts/SecretsContext';
import { supabase } from '@/lib/supabase/client';
import { getVaultMetadata } from '@/lib/storage';

export default function EncryptionProofPage() {
  const [encryptedData, setEncryptedData] = useState<any>(null);
  const [dbSecrets, setDbSecrets] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const { vaultId, userEmail } = useVault();
  const { secrets } = useSecrets();

  useEffect(() => {
    setMounted(true);
    
    // Get vault metadata from localStorage
    const metadata = getVaultMetadata();

    setEncryptedData({
      vaultSalt: metadata?.salt,
      authHash: metadata?.authHash,
      userEmail,
    });

    // Get encrypted secrets from Supabase
    if (vaultId) {
      fetchEncryptedSecrets();
    }
  }, [vaultId, userEmail]);

  const fetchEncryptedSecrets = async () => {
    if (!vaultId) return;

    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('vault_id', vaultId);

    if (data && !error) {
      setDbSecrets(data);
    }
  };

  if (!mounted) return null;

  const totalSecrets = secrets.length;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
               Encryption Proof
            </h1>
            <p className="text-slate-400">
              Verify that your data is truly encrypted in localStorage
            </p>
          </div>
          <Link href="/vault">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Vault
            </Button>
          </Link>
        </div>

        {/* Explanation */}
        <Alert variant="info">
          <Shield className="h-4 w-4" />
          <AlertTitle>How to verify your data is encrypted?</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Your encrypted secrets are stored in <strong>Supabase</strong> (PostgreSQL database) and cached in <strong>localStorage</strong>.</p>
            <p>Open <strong>Chrome DevTools</strong> (F12) → <strong>Application</strong> tab → <strong>Local Storage</strong> or check your Supabase dashboard to verify the data is stored as unreadable <code className="text-cyan-400">encrypted_data</code>.</p>
          </AlertDescription>
        </Alert>

        {/* Live Data from localStorage */}
        <Card className="glow-cyan">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-cyan-400" />
                Encrypted Data in Database
              </CardTitle>
              <Badge variant="success">AES-256-GCM Encrypted</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vault Metadata */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Vault Metadata:</h3>
              <div className="bg-slate-900 p-4 rounded-lg font-mono text-xs space-y-2 overflow-auto">
                <div>
                  <span className="text-slate-500">Email:</span>{' '}
                  <span className="text-emerald-400">{userEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500">Salt (for PBKDF2):</span>{' '}
                  <span className="text-cyan-400 break-all">{encryptedData?.vaultSalt?.substring(0, 80)}...</span>
                </div>
                <div>
                  <span className="text-slate-500">Auth Hash:</span>{' '}
                  <span className="text-amber-400 break-all">{encryptedData?.authHash?.substring(0, 80)}...</span>
                </div>
                <p className="text-slate-600 mt-2">
                   Your master password is NEVER stored, only the authentication hash
                </p>
              </div>
            </div>

            {/* Encrypted Secrets */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">
                Encrypted Secrets ({totalSecrets}):
              </h3>
              {dbSecrets.length > 0 ? (
                <div className="space-y-3">
                  {dbSecrets.slice(0, 3).map((secret: any, index: number) => (
                    <div key={secret.id} className="bg-slate-900 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-red-400" />
                        <span className="text-sm font-semibold text-slate-300">
                          Secret #{index + 1}
                        </span>
                        <Badge variant="destructive" className="text-xs">ENCRYPTED</Badge>
                      </div>
                      <div className="font-mono text-xs space-y-1 text-slate-400">
                        <div>
                          <span className="text-slate-500">ID:</span> {secret.id}
                        </div>
                        <div>
                          <span className="text-slate-500">Category:</span>{' '}
                          <span className="text-cyan-400">{secret.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Encrypted Data:</span>{' '}
                          <div className="bg-slate-950 p-2 mt-1 rounded break-all text-red-400">
                            {secret.encrypted_data}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">IV (Initialization Vector):</span>{' '}
                          <span className="text-amber-400">{secret.iv}</span>
                        </div>
                        <p className="text-slate-600 mt-2">
                           This encrypted text contains: name, username, password, URL and notes
                        </p>
                      </div>
                    </div>
                  ))}
                  {dbSecrets.length > 3 && (
                    <p className="text-sm text-slate-500 text-center">
                      ... and {dbSecrets.length - 3} more secrets (all encrypted)
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900 p-8 rounded-lg text-center text-slate-500">
                  <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No secrets saved yet</p>
                  <p className="text-xs mt-1">Add one from the vault to see how it gets encrypted</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-1">AES-256-GCM</h3>
                  <p className="text-sm text-slate-400">
                    Military-grade encryption. Each secret has its own unique IV for maximum security.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Lock className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-1">PBKDF2 Key Derivation</h3>
                  <p className="text-sm text-slate-400">
                    100,000 iterations to derive the encryption key from your master password.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Code className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-1">Zero-Knowledge</h3>
                  <p className="text-sm text-slate-400">
                    Your master password is NEVER stored. It only exists in memory while the vault is unlocked.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <Eye className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-1">Client-Side Encryption</h3>
                  <p className="text-sm text-slate-400">
                    All encryption/decryption happens in your browser. Only encrypted data is sent to the database.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle> How to Verify (Step by Step)</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <strong>Check Supabase:</strong> Go to your <a href="https://supabase.com/dashboard" target="_blank" className="text-cyan-400 hover:underline">Supabase Dashboard</a> → Table Editor → <code className="text-cyan-400">secrets</code> table
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <strong>Examine encrypted_data column:</strong> You'll see unreadable encrypted text, not your actual passwords
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <strong>Check localStorage (Optional):</strong> Press <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">F12</kbd> → Application → Local Storage → Verify cached data is also encrypted
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <div>
                  <strong>Confirmed:</strong> If you can't read your passwords in the database or localStorage, it means they're properly encrypted! 
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Encryption Flow Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-auto text-xs">
              <code className="text-slate-300">
{`// 1. User saves a secret
const secret = {
  name: "Facebook",
  username: "user@example.com",
  password: "MySecretPassword123!", //  PLAIN TEXT
  url: "https://facebook.com"
}

// 2. Gets encrypted with AES-256-GCM
const iv = crypto.getRandomValues(new Uint8Array(12)); // Unique IV
const encryptedData = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  encryptionKey, // Derived from your master password
  JSON.stringify(secret)
);

// 3. Encrypted data is saved to Supabase
await supabase.from('secrets').insert({
  vault_id: vaultId,
  encrypted_data: arrayBufferToBase64(encryptedData), //  ENCRYPTED
  iv: uint8ArrayToBase64(iv), // IV to decrypt later
  category: 'login'
});

// 4. To read it, requires your master password
// Without the correct password = impossible to decrypt `}
              </code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
