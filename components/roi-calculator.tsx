'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/lib/config-context';
import {
  calculateROI,
  calculateReturns,
  getTokensToNextTier,
  formatNumber,
  calculateRequiredInvestment,
  ROICalculation,
  ReturnsCalculation,
  PackageCombination
} from '@/lib/calculations';
import {
  Calculator,
  Coins,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Calendar,
  PiggyBank,
  Package
} from 'lucide-react';

export default function ROICalculator() {
  const { config, loading } = useConfig();
  const [inputMode, setInputMode] = useState<'custom' | 'package'>('package');
  const [customTokens, setCustomTokens] = useState<string>('5200');
  const [selectedPackage, setSelectedPackage] = useState<number>(0);
  
  const [roiCalc, setRoiCalc] = useState<ROICalculation | null>(null);
  const [returns, setReturns] = useState<ReturnsCalculation | null>(null);
  const [tokensToNext, setTokensToNext] = useState<number | null>(null);
  const [packageCombo, setPackageCombo] = useState<PackageCombination | null>(null);

  useEffect(() => {
    if (!config) return;
    
    let tokens = 0;
    let investmentUSD = 0;

    if (inputMode === 'custom') {
      tokens = parseFloat(customTokens) || 0;
      
      if (tokens > 0) {
        // Calculate required investment based on package combinations
        const combo = calculateRequiredInvestment(tokens, config.usdPackages);
        setPackageCombo(combo);
        investmentUSD = combo?.totalUSD ?? 0;
      } else {
        setPackageCombo(null);
      }
    } else {
      const pkg = config.usdPackages?.[selectedPackage];
      tokens = pkg?.tokens ?? 0;
      investmentUSD = pkg?.usd ?? 0;
      setPackageCombo(null);
    }

    if (tokens > 0) {
      const calc = calculateROI(tokens, config.tiers);
      setRoiCalc(calc);
      
      const ret = calculateReturns(tokens, investmentUSD, calc?.finalROI ?? 0);
      setReturns(ret);
      
      const toNext = getTokensToNextTier(tokens, config.tiers);
      setTokensToNext(toNext);
    } else {
      setRoiCalc(null);
      setReturns(null);
      setTokensToNext(null);
    }
  }, [inputMode, customTokens, selectedPackage, config]);

  const currentTokens =
    inputMode === 'custom'
      ? parseFloat(customTokens) || 0
      : config?.usdPackages?.[selectedPackage]?.tokens ?? 0;
      
  const currentInvestment =
    inputMode === 'custom'
      ? packageCombo?.totalUSD ?? 0
      : config?.usdPackages?.[selectedPackage]?.usd ?? 0;

  if (loading || !config) {
    return (
      <div className="w-full mx-auto space-y-1">
        <div className="text-center space-y-1">
          <p className="text-[10px] text-gray-400">
            Loading configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-1">{/* 1mm spacing between sections */}
      
      {/* ROW 1: Investment Input (Left) + Tier Info (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        
        {/* LEFT: Investment Input */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <h2 className="text-xs font-bold text-white">Investment Input</h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('package')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-semibold transition-all ${
                inputMode === 'package'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              USD Package
            </button>
            <button
              onClick={() => setInputMode('custom')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-semibold transition-all ${
                inputMode === 'custom'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Custom Amount
            </button>
          </div>

          {inputMode === 'package' && (
            <div className="space-y-1.5">
              <label className="block text-[9px] font-semibold text-gray-400">
                Select USD Package
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
                {config?.usdPackages?.map((pkg, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPackage(index)}
                    className={`p-1.5 rounded-md border transition-all hover:scale-105 ${
                      selectedPackage === index
                        ? 'border-emerald-500 bg-emerald-900/30 shadow-md shadow-emerald-500/20'
                        : 'border-gray-600/50 bg-gray-800/30 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-white">
                      ${formatNumber(pkg?.usd ?? 0, 0)}
                    </div>
                    <div className="text-[8px] text-gray-400">
                      {formatNumber(pkg?.tokens ?? 0, 0)}
                    </div>
                  </button>
                )) ?? null}
              </div>
            </div>
          )}

          {inputMode === 'custom' && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="block text-[9px] font-semibold text-gray-400">
                  Token Amount
                </label>
                <div className="relative">
                  <Coins className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input
                    type="number"
                    value={customTokens}
                    onChange={(e) => setCustomTokens(e?.target?.value ?? '')}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-600/50 bg-gray-800/30 rounded-md focus:border-emerald-500 focus:outline-none text-xs text-white placeholder-gray-500"
                    placeholder="Enter token amount"
                    min="0"
                  />
                </div>
              </div>

              {packageCombo && packageCombo.packages.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-600/30 rounded-md p-2 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-emerald-400" />
                    <div>
                      <h3 className="text-[9px] font-bold text-white">Required Investment</h3>
                      <p className="text-[8px] text-gray-400">Packages for {formatNumber(currentTokens, 0)} tokens</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 rounded-sm p-1.5 space-y-1">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-700/50">
                      <span className="text-[8px] font-semibold text-gray-400">Package</span>
                      <span className="text-[8px] font-semibold text-gray-400">Tokens</span>
                    </div>
                    
                    {packageCombo.packages.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium text-[9px]">
                            {item.quantity > 1 ? `${item.quantity} × ` : ''}${formatNumber(item?.package?.usd ?? 0, 0)}
                          </span>
                        </div>
                        <span className="text-gray-400 text-[9px]">
                          {formatNumber((item?.package?.tokens ?? 0) * item.quantity, 0)}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-1 border-t border-gray-700/50">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-bold text-white">Total</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        ${formatNumber(packageCombo.totalUSD, 0)}
                      </span>
                    </div>

                    {packageCombo.totalTokens !== currentTokens && (
                      <div className="text-[8px] text-gray-500 text-center pt-0.5">
                        Receive {formatNumber(packageCombo.totalTokens, 0)} tokens ({formatNumber(packageCombo.totalTokens - currentTokens, 0)} extra)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Tier Information */}
        {roiCalc ? (
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2 border border-gray-700/50">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white">
                    {roiCalc?.tier?.name ?? ''}
                    {roiCalc?.tier?.range?.max !== Infinity && (
                      <span className="text-[9px] ml-1 text-gray-400 font-normal">
                        - Up to {formatNumber(roiCalc.tier.range.max, 0)}
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-[8px] text-gray-400">
                  Staking {formatNumber(currentTokens, 0)} tokens
                </p>
              </div>
              <div className="text-right">
                <div className="text-[8px] text-gray-400 mb-0.5">Annual ROI</div>
                <div className="text-base font-bold text-emerald-400">
                  {((roiCalc?.finalROI ?? 0) * 12).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Calculation Breakdown - HIDDEN but logic kept */}
            {!roiCalc?.tier?.isFixed && (
              <div style={{ display: 'none' }}>
                <h4 className="font-semibold text-gray-900 text-xs">Calculation Breakdown</h4>
                <div className="grid md:grid-cols-3 gap-2">
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-gray-600">Base Bonus (A)</div>
                    <div className="text-sm font-bold text-gray-900">
                      {roiCalc?.baseBonus?.toFixed(2) ?? '0.00'}%
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-gray-600">Proportional Bonus (B)</div>
                    <div className="text-sm font-bold text-gray-900">
                      {roiCalc?.proportionalBonus?.toFixed(2) ?? '0.00'}%
                    </div>
                    <div className="text-[8px] text-gray-500">
                      {formatNumber(currentTokens, 0)} / {formatNumber(roiCalc?.tier?.proportionalDivisor ?? 1, 0)} × {roiCalc?.tier?.proportionalMultiplier ?? 0}%
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-gray-600">
                      {roiCalc?.constraintApplied === 'min' ? 'Monthly ROI' : 'Total Bonus (A+B)'}
                    </div>
                    {roiCalc?.constraintApplied === 'min' ? (
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-gray-500 line-through">
                          {roiCalc?.totalBonus?.toFixed(2) ?? '0.00'}%
                        </div>
                        <div className="text-sm font-bold text-green-600">
                          {roiCalc?.finalROI?.toFixed(2) ?? '0.00'}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-gray-900">
                        {roiCalc?.totalBonus?.toFixed(2) ?? '0.00'}%
                      </div>
                    )}
                  </div>
                </div>

                {roiCalc?.constraintApplied === 'min' && (
                  <div className="flex items-start gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-400 rounded-md p-2 shadow-sm">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-green-900 text-xs mb-0.5">
                        🎉 Bonus Recalculated!
                      </div>
                      <div className="text-[9px] text-green-800 font-medium">
                        Upgraded to <span className="font-bold text-xs text-green-600">{roiCalc?.finalROI?.toFixed(2)}%</span> monthly ROI!
                      </div>
                    </div>
                  </div>
                )}

                {roiCalc?.constraintApplied === 'max' && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-2">
                    <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-900 text-[9px]">
                        Maximum ROI Applied
                      </div>
                      <div className="text-[8px] text-amber-700">
                        Adjusted to {roiCalc?.finalROI?.toFixed(2) ?? '0.00'}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {roiCalc?.tier?.isFixed && (
              <div className="bg-white/50 rounded-lg p-2" style={{ display: 'none' }}>
                <div className="flex items-center gap-1 text-green-600">
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-semibold text-[9px]">Fixed ROI Tier</span>
                </div>
              </div>
            )}

            {tokensToNext !== null && config?.tiers && (
              <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-md p-1.5">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white text-[9px]">
                      Next Tier is: {config.tiers[Math.min((config.tiers.findIndex(t => t.name === roiCalc?.tier?.name) ?? 0) + 1, config.tiers.length - 1)]?.name ?? 'Max Tier'}
                    </div>
                    <div className="text-[8px] text-gray-400">
                      Stake {formatNumber(tokensToNext, 0)} more tokens to reach it
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-700/50">
            <p className="text-[9px] text-gray-400 text-center">Select an investment to see tier information</p>
          </div>
        )}
      </div>

      {/* ROW 2: Projected Returns (Full Width) */}
      {returns && currentInvestment > 0 && (
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-3 h-3 text-emerald-400" />
            <h3 className="text-xs font-bold text-white">Projected Returns</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-2">
            <div className="bg-gray-800/40 rounded-md p-2 shadow-sm space-y-1">
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3 h-3" />
                <span className="font-semibold text-[9px]">Annual</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-base font-bold text-emerald-400">
                  ${formatNumber(returns?.annualUSD ?? 0)}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/40 rounded-md p-2 shadow-sm space-y-1">
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3 h-3" />
                <span className="font-semibold text-[9px]">Monthly</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-base font-bold text-emerald-400">
                  ${formatNumber(returns?.monthlyUSD ?? 0)}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/40 rounded-md p-2 shadow-sm space-y-1">
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3 h-3" />
                <span className="font-semibold text-[9px]">Daily</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-base font-bold text-emerald-400">
                  ${formatNumber(returns?.dailyUSD ?? 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <div className="grid md:grid-cols-2 gap-2 text-[9px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Initial Investment:</span>
                <span className="font-semibold text-white">
                  ${formatNumber(currentInvestment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total After 1 Year:</span>
                <span className="font-semibold text-emerald-400">
                  ${formatNumber(currentInvestment + (returns?.annualUSD ?? 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}