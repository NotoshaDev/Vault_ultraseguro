'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Copy, Check } from 'lucide-react';
import {
  generatePassword,
  calculatePasswordStrength,
  getPasswordStrengthInfo,
  DEFAULT_PASSWORD_OPTIONS,
  type PasswordOptions,
  type PasswordStrength,
} from '@/lib/password-generator';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  compact?: boolean;
}

export function PasswordGenerator({ onPasswordGenerated, compact = false }: PasswordGeneratorProps) {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>('weak');
  const [copied, setCopied] = useState(false);

  // Generate initial password
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    setStrength(calculatePasswordStrength(newPassword));
    
    if (onPasswordGenerated) {
      onPasswordGenerated(newPassword);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateOption = <K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const strengthInfo = getPasswordStrengthInfo(strength);
  const strengthPercentage = { weak: 25, medium: 50, strong: 75, 'very-strong': 100 }[strength];

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={password}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={copied ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Length: {options.length}</span>
            <Badge variant={strength === 'very-strong' || strength === 'strong' ? 'success' : 'warning'}>
              {strengthInfo.label}
            </Badge>
          </div>
          <Slider
            value={options.length}
            min={8}
            max={64}
            onChange={(e) => updateOption('length', parseInt(e.target.value))}
            showValue={false}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Switch
              checked={options.uppercase}
              onChange={(e) => updateOption('uppercase', e.target.checked)}
              className="scale-75"
            />
            <span className="text-slate-300">A-Z</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={options.lowercase}
              onChange={(e) => updateOption('lowercase', e.target.checked)}
              className="scale-75"
            />
            <span className="text-slate-300">a-z</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={options.numbers}
              onChange={(e) => updateOption('numbers', e.target.checked)}
              className="scale-75"
            />
            <span className="text-slate-300">0-9</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={options.symbols}
              onChange={(e) => updateOption('symbols', e.target.checked)}
              className="scale-75"
            />
            <span className="text-slate-300">!@#</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Switch
            checked={options.excludeAmbiguous}
            onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
            className="scale-75"
          />
          <span className="text-slate-400">Exclude ambiguous (0O1lI)</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Password Display */}
        <div className="space-y-2">
          <Label>Generated Password</Label>
          <div className="flex gap-2">
            <Input
              value={password}
              readOnly
              className="font-mono text-lg"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={copied ? 'secondary' : 'outline'}
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Strength Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Strength</Label>
            <Badge
              variant={
                strength === 'very-strong' || strength === 'strong'
                  ? 'success'
                  : strength === 'medium'
                  ? 'warning'
                  : 'destructive'
              }
            >
              {strengthInfo.label}
            </Badge>
          </div>
          <Progress 
            value={strengthPercentage} 
            variant={
              strength === 'very-strong' || strength === 'strong'
                ? 'success'
                : strength === 'medium'
                ? 'warning'
                : 'danger'
            } 
          />
        </div>

        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Length</Label>
            <span className="text-sm font-semibold text-cyan-400">{options.length}</span>
          </div>
          <Slider
            value={options.length}
            min={8}
            max={64}
            onChange={(e) => updateOption('length', parseInt(e.target.value))}
            showValue={false}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        {/* Character Types */}
        <div className="space-y-3">
          <Label>Character Types</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Uppercase (A-Z)</span>
              <Switch
                checked={options.uppercase}
                onChange={(e) => updateOption('uppercase', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Lowercase (a-z)</span>
              <Switch
                checked={options.lowercase}
                onChange={(e) => updateOption('lowercase', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Numbers (0-9)</span>
              <Switch
                checked={options.numbers}
                onChange={(e) => updateOption('numbers', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Symbols (!@#$%)</span>
              <Switch
                checked={options.symbols}
                onChange={(e) => updateOption('symbols', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>Options</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Exclude ambiguous (0O1lI)</span>
            <Switch
              checked={options.excludeAmbiguous}
              onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
            />
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="glow"
          className="w-full"
          onClick={handleGenerate}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate New Password
        </Button>
      </CardContent>
    </Card>
  );
}
