'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { type SecretData, type SecretCategory } from '@/lib/secrets';
import { Mail, Key, Globe, Tag, Sparkles } from 'lucide-react';

interface SecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (secret: Omit<SecretData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editSecret?: SecretData | null;
}

export function SecretModal({ isOpen, onClose, onSave, editSecret }: SecretModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    url: '',
    category: 'login' as SecretCategory,
    notes: '',
    isFavorite: false,
  });

  // Load edit data
  useEffect(() => {
    if (editSecret) {
      setFormData({
        name: editSecret.name,
        username: editSecret.username || '',
        password: editSecret.password,
        url: editSecret.url || '',
        category: editSecret.category,
        notes: editSecret.notes || '',
        isFavorite: editSecret.isFavorite,
      });
    } else {
      // Reset form
      setFormData({
        name: '',
        username: '',
        password: '',
        url: '',
        category: 'login',
        notes: '',
        isFavorite: false,
      });
    }
    setError('');
  }, [editSecret, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError('Failed to save secret');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editSecret ? 'Edit Secret' : 'Add New Secret'}</DialogTitle>
          <DialogDescription>
            {editSecret
              ? 'Update your secret information'
              : 'All data will be encrypted with AES-256-GCM'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 px-6 pb-4 overflow-y-auto flex-1 max-h-[calc(90vh-200px)]">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" required>Name</Label>
              <Input
                id="name"
                placeholder="My GitHub Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                icon={<Tag className="h-4 w-4" />}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SecretCategory })}
                disabled={isLoading}
              >
                <option value="login">Login</option>
                <option value="credit-card">Credit Card</option>
                <option value="api-key">API Key</option>
                <option value="note">Secure Note</option>
                <option value="other">Other</option>
              </Select>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username / Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="john@example.com"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isLoading}
                icon={<Mail className="h-4 w-4" />}
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>Password / Secret</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGenerator(!showGenerator)}
                  disabled={isLoading}
                  className="text-xs h-7"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {showGenerator ? 'Hide' : 'Generate'}
                </Button>
              </div>
              <Input
                id="password"
                type="text"
                placeholder="Your secret password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                icon={<Key className="h-4 w-4" />}
                autoComplete="off"
              />
              
              {showGenerator && (
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                  <PasswordGenerator
                    compact
                    onPasswordGenerated={(password) => setFormData({ ...formData, password })}
                  />
                </div>
              )}
              
              <p className="text-xs text-slate-500">
                This will be encrypted before storage
              </p>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                disabled={isLoading}
                icon={<Globe className="h-4 w-4" />}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or information..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Favorite Toggle */}
            <div className="flex items-center justify-between py-2">
              <Switch
                id="favorite"
                checked={formData.isFavorite}
                onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                label="Mark as favorite"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : editSecret ? 'Update Secret' : 'Add Secret'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
