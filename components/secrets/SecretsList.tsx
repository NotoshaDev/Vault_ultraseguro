'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecrets } from '@/contexts/SecretsContext';
import { SecretCard } from './SecretCard';
import { SecretModal } from './SecretModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState, LoadingSpinner } from '@/components/layout';
import { Search, Plus, Shield, Filter } from 'lucide-react';
import { type SecretData, type SecretCategory } from '@/lib/secrets';
import { useToast } from '@/components/ui/toast';

export function SecretsList() {
  const {
    filteredSecrets,
    isLoading,
    addSecret,
    updateSecret,
    deleteSecret,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
  } = useSecrets();

  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<SecretData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddSecret = () => {
    setEditingSecret(null);
    setIsModalOpen(true);
  };

  const handleEditSecret = (secret: SecretData) => {
    setEditingSecret(secret);
    setIsModalOpen(true);
  };

  const handleSaveSecret = async (secret: Omit<SecretData, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSecret) {
      await updateSecret(editingSecret.id, secret);
      addToast({
        type: 'success',
        title: 'Secret updated',
        description: 'Your secret has been updated successfully',
      });
    } else {
      await addSecret(secret);
      addToast({
        type: 'success',
        title: 'Secret added',
        description: 'Your secret has been securely encrypted and saved',
      });
    }
  };

  const handleDeleteSecret = async (id: string) => {
    if (confirm('Are you sure you want to delete this secret? This action cannot be undone.')) {
      setDeletingId(id);
      await deleteSecret(id);
      setDeletingId(null);
      addToast({
        type: 'success',
        title: 'Secret deleted',
        description: 'Your secret has been permanently deleted',
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCategoryFilter('all');
  };

  // Separate favorites
  const favorites = filteredSecrets.filter(s => s.isFavorite);
  const regularSecrets = filteredSecrets.filter(s => !s.isFavorite);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search secrets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as SecretCategory | 'all')}
            icon={<Filter className="h-4 w-4" />}
            className="w-40"
          >
            <option value="all">All Categories</option>
            <option value="login">Login</option>
            <option value="credit-card">Credit Card</option>
            <option value="api-key">API Key</option>
            <option value="note">Note</option>
            <option value="other">Other</option>
          </Select>
          <Button variant="glow" onClick={handleAddSecret}>
            <Plus className="h-4 w-4 mr-2" />
            Add Secret
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || categoryFilter !== 'all') && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Active filters:</span>
          {searchQuery && (
            <Badge variant="default">
              Search: "{searchQuery}"
            </Badge>
          )}
          {categoryFilter !== 'all' && (
            <Badge variant="secondary">
              Category: {categoryFilter}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      {filteredSecrets.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            {filteredSecrets.length} {filteredSecrets.length === 1 ? 'secret' : 'secrets'} found
          </span>
          {favorites.length > 0 && (
            <span className="text-amber-400">★ {favorites.length} favorites</span>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredSecrets.length === 0 && (
        <EmptyState
          icon={<Shield className="w-16 h-16" />}
          title={searchQuery || categoryFilter !== 'all' ? 'No secrets found' : 'No secrets yet'}
          description={
            searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start securing your passwords, API keys, and sensitive notes'
          }
          action={
            searchQuery || categoryFilter !== 'all' ? (
              <Button variant="outline" onClick={handleClearSearch}>
                Clear Filters
              </Button>
            ) : (
              <Button variant="glow" onClick={handleAddSecret}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Secret
              </Button>
            )
          }
        />
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
            ★ Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {favorites.map((secret, index) => (
                <motion.div
                  key={secret.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SecretCard
                    secret={secret}
                    onEdit={handleEditSecret}
                    onDelete={handleDeleteSecret}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Regular Secrets Section */}
      {regularSecrets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: favorites.length > 0 ? 0.2 : 0 }}
        >
          {favorites.length > 0 && (
            <h2 className="text-lg font-semibold text-slate-400 mb-4">All Secrets</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {regularSecrets.map((secret, index) => (
                <motion.div
                  key={secret.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SecretCard
                    secret={secret}
                    onEdit={handleEditSecret}
                    onDelete={handleDeleteSecret}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Secret Modal */}
      <SecretModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSecret(null);
        }}
        onSave={handleSaveSecret}
        editSecret={editingSecret}
      />

      {/* Info Alert */}
      {filteredSecrets.length > 0 && (
        <Alert variant="info" className="mt-8">
          <AlertTitle>Security Tip</AlertTitle>
          <AlertDescription>
            All secrets are encrypted with AES-256-GCM before storage. Your master password is required to decrypt them.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
