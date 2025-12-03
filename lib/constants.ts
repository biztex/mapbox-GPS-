// Tier definitions and constants

export interface TierConfig {
  name: string;
  range: { min: number; max: number };
  baseBonus: number;
  proportionalDivisor: number;
  proportionalMultiplier: number;
  minROI: number;
  maxROI: number;
  color: string;
  bgColor: string;
  borderColor: string;
  isFixed?: boolean;
  description?: string;
}

export const TIER_CONFIGS: TierConfig[] = [
  {
    name: 'Tier 1 (NexEconomy)',
    range: { min: 1, max: 100000 },
    baseBonus: 1.00,
    proportionalDivisor: 100000,
    proportionalMultiplier: 5,
    minROI: 1.00,
    maxROI: 2.00,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300'
  },
  {
    name: 'Tier 2 (NexComfort)',
    range: { min: 100001, max: 350000 },
    baseBonus: 1.00,
    proportionalDivisor: 350000,
    proportionalMultiplier: 5,
    minROI: 2.20,
    maxROI: 2.75,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  },
  {
    name: 'Tier 3 (NexXL)',
    range: { min: 350001, max: 800000 },
    baseBonus: 1.00,
    proportionalDivisor: 800000,
    proportionalMultiplier: 5,
    minROI: 3.25,
    maxROI: 4.00,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300'
  },
  {
    name: 'Tier 4 (NexLuxury)',
    range: { min: 800001, max: 1750000 },
    baseBonus: 1.00,
    proportionalDivisor: 1750000,
    proportionalMultiplier: 5,
    minROI: 4.50,
    maxROI: 5.00,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    isFixed: false
  },
  {
    name: 'Tier 5 (NexPartner)',
    range: { min: 1750001, max: Infinity },
    baseBonus: 5.00,
    proportionalDivisor: 1,
    proportionalMultiplier: 0,
    minROI: 5.00,
    maxROI: 5.00,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    isFixed: true,
    description: 'More benefits - contact us for more info'
  }
];

export interface USDPackage {
  usd: number;
  tokens: number;
}

export const USD_PACKAGES: USDPackage[] = [
  { usd: 100, tokens: 5200 },
  { usd: 300, tokens: 16000 },
  { usd: 500, tokens: 28000 },
  { usd: 1000, tokens: 56400 },
  { usd: 2500, tokens: 142000 },
  { usd: 5000, tokens: 288000 },
  { usd: 7000, tokens: 426000 },
  { usd: 10000, tokens: 650000 },
  { usd: 25000, tokens: 1750000 },
  { usd: 50000, tokens: 3500000 }
];
