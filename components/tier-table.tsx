'use client';

import { useConfig } from '@/lib/config-context';
import { formatNumber } from '@/lib/calculations';
import { TrendingUp } from 'lucide-react';

export default function TierTable() {
  const { config, loading } = useConfig();

  if (loading || !config) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">Tier Comparison</h2>
        </div>
        <div className="text-center py-8 text-gray-600">
          Loading tiers...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-3 h-3 text-emerald-400" />
        <h2 className="text-xs font-bold text-white">Tier Comparison</h2>
      </div>
      
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm text-[9px] border border-gray-700/50">
          <thead>
            <tr className="bg-gradient-to-r from-emerald-600/40 to-teal-600/40 text-white border-b border-gray-700/50">
              <th className="px-2 py-1.5 text-left font-semibold">Tier</th>
              <th className="px-2 py-1.5 text-left font-semibold">Token Range</th>
              {/* ROI Range column - HIDDEN but logic kept */}
              <th className="px-2 py-1.5 text-left font-semibold" style={{ display: 'none' }}>ROI Range</th>
            </tr>
          </thead>
          <tbody>
            {config.tiers?.map((tier, index) => (
              <tr
                key={index}
                className={`border-b border-gray-700/30 hover:bg-gray-800/50 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-800/20'}`}
              >
                <td className="px-2 py-1.5">
                  <span className="font-semibold text-emerald-400">
                    {tier?.name ?? ''}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-gray-300">
                  {formatNumber(tier?.range?.min ?? 0, 0)} - {tier?.range?.max === Infinity ? '∞' : formatNumber(tier?.range?.max ?? 0, 0)}
                </td>
                {/* ROI Range data - HIDDEN but logic kept */}
                <td className="px-2 py-1.5" style={{ display: 'none' }}>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-emerald-400">
                      {tier?.minROI?.toFixed(2) ?? '0.00'}% - {tier?.maxROI?.toFixed(2) ?? '0.00'}%
                    </span>
                    {tier?.description && (
                      <div className="text-[8px] text-teal-400 italic">
                        {tier.description}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) ?? null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
