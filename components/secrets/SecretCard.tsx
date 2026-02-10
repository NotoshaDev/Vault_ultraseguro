'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast';
import { getCategoryInfo, type SecretData } from '@/lib/secrets';
import { Eye, EyeOff, Copy, Edit, Trash2, Star, ExternalLink, User, Key } from 'lucide-react';

interface SecretCardProps {
  secret: SecretData;
  onEdit: (secret: SecretData) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function SecretCard({ secret, onEdit, onDelete, onToggleFavorite }: SecretCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<'password' | 'username' | null>(null);
  const { addToast } = useToast();
  
  const categoryInfo = getCategoryInfo(secret.category);

  const copyToClipboard = async (text: string, type: 'password' | 'username') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    
    addToast({
      type: 'success',
      title: `${type === 'password' ? 'Password' : 'Username'} copied`,
      description: 'Copied to clipboard successfully',
      duration: 2000,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:border-cyan-500/50 transition-all duration-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-200 truncate">{secret.name}</h3>
              <button
                onClick={() => onToggleFavorite(secret.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star
                  className={`h-4 w-4 ${
                    secret.isFavorite
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-500 hover:text-amber-400'
                  }`}
                />
              </button>
            </div>
            <Badge variant="default" className="text-xs">
              {categoryInfo.label}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip content="Edit">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(secret)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
            <Tooltip content="Delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300"
                onClick={() => onDelete(secret.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Username */}
        {secret.username && (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400 truncate flex-1">{secret.username}</span>
            <Tooltip content={copied === 'username' ? 'Copied!' : 'Copy username'}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => copyToClipboard(secret.username!, 'username')}
              >
                <Copy className={`h-3 w-3 ${copied === 'username' ? 'text-emerald-400' : ''}`} />
              </Button>
            </Tooltip>
          </div>
        )}

        {/* Password */}
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Key className="h-3.5 w-3.5 text-slate-500" />
          <span className="font-mono text-slate-300 flex-1 truncate">
            {showPassword ? secret.password : '••••••••••••'}
          </span>
          <div className="flex gap-1">
            <Tooltip content={showPassword ? 'Hide' : 'Show'}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content={copied === 'password' ? 'Copied!' : 'Copy password'}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(secret.password, 'password')}
              >
                <Copy className={`h-3 w-3 ${copied === 'password' ? 'text-emerald-400' : ''}`} />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* URL */}
        {secret.url && (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            <a
              href={secret.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 truncate flex-1 text-xs"
            >
              {secret.url}
            </a>
          </div>
        )}

        {/* Notes */}
        {secret.notes && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-500 line-clamp-2">{secret.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-600">
          <span>Created {new Date(secret.createdAt).toLocaleDateString()}</span>
          {secret.isFavorite && (
            <span className="text-amber-400">★ Favorite</span>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
