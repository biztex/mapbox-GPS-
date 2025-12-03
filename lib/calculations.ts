import { TIER_CONFIGS, TierConfig, USD_PACKAGES, USDPackage } from './constants';

export interface ROICalculation {
  tier: TierConfig;
  tierIndex: number;
  baseBonus: number;
  proportionalBonus: number;
  totalBonus: number;
  finalROI: number;
  constraintApplied: 'min' | 'max' | 'none';
}

export interface ReturnsCalculation {
  annualUSD: number;
  monthlyUSD: number;
  dailyUSD: number;
  annualTokens: number;
  monthlyTokens: number;
  dailyTokens: number;
}

export interface PackageCombination {
  totalUSD: number;
  totalTokens: number;
  packages: { package: USDPackage; quantity: number }[];
}

export function getTier(tokens: number, tiers?: TierConfig[]): { tier: TierConfig; index: number } {
  const configs = tiers || TIER_CONFIGS;
  const tierIndex = configs.findIndex(
    (tier) => tokens >= tier.range.min && tokens <= tier.range.max
  );
  
  if (tierIndex === -1) {
    return { tier: configs[configs.length - 1] ?? configs[0], index: configs.length - 1 };
  }
  
  return { tier: configs[tierIndex] ?? configs[0], index: tierIndex };
}

export function calculateROI(tokens: number, tiers?: TierConfig[]): ROICalculation {
  const { tier, index } = getTier(tokens, tiers);
  
  if (tier?.isFixed) {
    return {
      tier: tier,
      tierIndex: index,
      baseBonus: tier.baseBonus ?? 5.00,
      proportionalBonus: 0,
      totalBonus: tier.baseBonus ?? 5.00,
      finalROI: tier.baseBonus ?? 5.00,
      constraintApplied: 'none'
    };
  }
  
  const baseBonus = tier?.baseBonus ?? 0;
  const proportionalBonus = 
    (tokens / (tier?.proportionalDivisor ?? 1)) * (tier?.proportionalMultiplier ?? 0);
  const totalBonus = baseBonus + proportionalBonus;
  
  let finalROI = totalBonus;
  let constraintApplied: 'min' | 'max' | 'none' = 'none';
  
  const minROI = tier?.minROI ?? 0;
  const maxROI = tier?.maxROI ?? 0;
  
  if (totalBonus < minROI) {
    finalROI = minROI;
    constraintApplied = 'min';
  } else if (totalBonus > maxROI) {
    finalROI = maxROI;
    constraintApplied = 'max';
  }
  
  return {
    tier: tier ?? (tiers || TIER_CONFIGS)[0],
    tierIndex: index,
    baseBonus,
    proportionalBonus,
    totalBonus,
    finalROI,
    constraintApplied
  };
}

export function calculateReturns(
  tokens: number,
  investmentUSD: number,
  roiPercentage: number
): ReturnsCalculation {
  // ROI percentage is MONTHLY, not annual
  const monthlyUSD = investmentUSD * (roiPercentage / 100);
  const annualUSD = monthlyUSD * 12;  // Multiply by 12 for annual
  const dailyUSD = monthlyUSD / 30;   // Divide by 30 for daily
  
  const monthlyTokens = tokens * (roiPercentage / 100);
  const annualTokens = monthlyTokens * 12;  // Multiply by 12 for annual
  const dailyTokens = monthlyTokens / 30;   // Divide by 30 for daily
  
  return {
    annualUSD,
    monthlyUSD,
    dailyUSD,
    annualTokens,
    monthlyTokens,
    dailyTokens
  };
}

export function getTokensToNextTier(currentTokens: number, tiers?: TierConfig[]): number | null {
  const configs = tiers || TIER_CONFIGS;
  const { tier, index } = getTier(currentTokens, tiers);
  
  if (index >= configs.length - 1) {
    return null;
  }
  
  const nextTier = configs[index + 1];
  const tokensNeeded = (nextTier?.range?.min ?? 0) - currentTokens;
  
  return tokensNeeded > 0 ? tokensNeeded : null;
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num?.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }) ?? '0.00';
}

/**
 * Calculates the optimal package combination to reach target tokens
 * Uses a greedy algorithm starting from the largest packages
 */
export function calculateRequiredInvestment(targetTokens: number, packages?: USDPackage[]): PackageCombination {
  if (targetTokens <= 0) {
    return {
      totalUSD: 0,
      totalTokens: 0,
      packages: []
    };
  }

  const usdPackages = packages || USD_PACKAGES;
  // Sort packages by tokens in descending order
  const sortedPackages = [...usdPackages].sort((a, b) => b.tokens - a.tokens);
  
  const result: { package: USDPackage; quantity: number }[] = [];
  let remainingTokens = targetTokens;
  let totalUSD = 0;
  let totalTokens = 0;

  // Greedy approach: use largest packages first
  for (const pkg of sortedPackages) {
    const quantity = Math.floor(remainingTokens / pkg.tokens);
    
    if (quantity > 0) {
      result.push({ package: pkg, quantity });
      remainingTokens -= quantity * pkg.tokens;
      totalUSD += quantity * pkg.usd;
      totalTokens += quantity * pkg.tokens;
    }

    if (remainingTokens === 0) break;
  }

  // If there are remaining tokens, add one more of the smallest package that covers them
  if (remainingTokens > 0) {
    for (const pkg of [...usdPackages].sort((a, b) => a.tokens - b.tokens)) {
      if (pkg.tokens >= remainingTokens) {
        // Check if this package is already in the result
        const existing = result.find(r => r.package.usd === pkg.usd);
        if (existing) {
          existing.quantity += 1;
        } else {
          result.push({ package: pkg, quantity: 1 });
        }
        totalUSD += pkg.usd;
        totalTokens += pkg.tokens;
        break;
      }
    }
  }

  // Sort result by package USD value (descending) for better display
  result.sort((a, b) => b.package.usd - a.package.usd);

  return {
    totalUSD,
    totalTokens,
    packages: result
  };
}
