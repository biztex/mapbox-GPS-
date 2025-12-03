'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TierConfig, USDPackage } from './constants';

interface ConfigData {
  tiers: TierConfig[];
  usdPackages: USDPackage[];
}

interface ConfigContextType {
  config: ConfigData | null;
  loading: boolean;
  error: string | null;
  reloadConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/config');
      
      if (!response.ok) {
        throw new Error('Failed to load configuration');
      }
      
      const data = await response.json();
      
      // Transform the config from admin format to application format
      const transformedTiers: TierConfig[] = data.tiers.map((tier: any, index: number) => ({
        name: `Tier ${tier.id} (${tier.name})`,
        range: {
          min: tier.minTokens,
          max: tier.maxTokens === null ? Infinity : tier.maxTokens
        },
        baseBonus: tier.baseBonus,
        proportionalDivisor: tier.maxTokens === null ? 1 : tier.maxTokens,
        proportionalMultiplier: tier.proportionalMultiplier,
        minROI: tier.minROI,
        maxROI: tier.maxROI,
        color: getColorClass(tier.color, 'text'),
        bgColor: getColorClass(tier.color, 'bg'),
        borderColor: getColorClass(tier.color, 'border'),
        isFixed: tier.minROI === tier.maxROI,
        description: tier.description || undefined
      }));
      
      setConfig({
        tiers: transformedTiers,
        usdPackages: data.usdPackages
      });
    } catch (err) {
      console.error('Error loading config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error, reloadConfig: loadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Helper function to convert hex colors to Tailwind classes
function getColorClass(hexColor: string, type: 'text' | 'bg' | 'border'): string {
  // Map common hex colors to Tailwind classes
  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    '#3b82f6': { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
    '#10b981': { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' },
    '#f59e0b': { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' },
    '#8b5cf6': { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300' },
    '#ef4444': { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' },
  };

  const mapped = colorMap[hexColor.toLowerCase()];
  if (mapped) {
    return mapped[type];
  }

  // Fallback to generic classes
  return type === 'text' ? 'text-gray-600' : type === 'bg' ? 'bg-gray-50' : 'border-gray-300';
}
