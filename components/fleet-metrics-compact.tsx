'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Navigation, Leaf, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/fleet-calculations';

interface FleetData {
  totalFleet: number;
  activeCars: number;
  tripsToday: number;
  lifetimeTrips: number;
  lifetimePassengers: number;
  revenueToday: number;
  revenueThisMonth: number;
  investorPool: number;
  co2Saved: number;
  lastUpdated: string;
  inMaintenance?: number;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  gradient: string;
}

function MetricCard({ icon, label, value, subtext, gradient }: MetricCardProps) {
  return (
    <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="relative p-2.5">
        <div className="flex items-start justify-between mb-1">
          <div className="p-1.5 bg-white/30 rounded-lg backdrop-blur-sm shadow">
            <div className="w-4 h-4">{icon}</div>
          </div>
          {subtext && (
            <Badge className="bg-white/40 text-white border-0 font-semibold text-[8px] px-1.5 py-0">
              {subtext}
            </Badge>
          )}
        </div>
        <h3 className="text-[8px] font-semibold text-white/90 mb-0.5 uppercase tracking-wide">{label}</h3>
        <p className="text-lg font-black text-white drop-shadow">{value}</p>
      </div>
    </Card>
  );
}

export default function FleetMetricsCompact({ data }: { data: FleetData }) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatDateTime(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate next distribution date (7th of next month)
  const now = new Date();
  const nextDistribution = new Date(now.getFullYear(), now.getMonth() + 1, 7);
  const nextDistributionStr = nextDistribution.toLocaleDateString('en-AE', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-2">
      {/* Header with time */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
            Today's Performance
          </h2>
          <p className="text-[9px] text-white">{currentTime}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[8px] text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Auto-updating</span>
          </div>
          <p className="text-[10px] font-bold text-emerald-600">2 Hours</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* 1. Fleet Active */}
        <MetricCard
          icon={<Navigation className="w-full h-full text-white" />}
          label="Fleet Active"
          value={`${data.activeCars}/${data.totalFleet}`}
          subtext="Random"
          gradient="from-emerald-500 via-emerald-600 to-teal-600"
        />

        {/* 2. Trips Today */}
        <MetricCard
          icon={<Navigation className="w-full h-full text-white" />}
          label="Trips Today"
          value={data.tripsToday.toLocaleString()}
          subtext="2hr updates"
          gradient="from-teal-500 via-teal-600 to-cyan-600"
        />

        {/* 3. Total Trips */}
        <MetricCard
          icon={<Navigation className="w-full h-full text-white" />}
          label="Total Trips"
          value={data.lifetimeTrips.toLocaleString()}
          subtext="All Time"
          gradient="from-cyan-500 via-cyan-600 to-sky-600"
        />

        {/* 4. Total Passengers */}
        <MetricCard
          icon={<Users className="w-full h-full text-white" />}
          label="Total Passengers"
          value={data.lifetimePassengers.toLocaleString()}
          subtext="All Time"
          gradient="from-sky-500 via-sky-600 to-blue-600"
        />

        {/* 5. Revenue Today */}
        <MetricCard
          icon={<DollarSign className="w-full h-full text-white" />}
          label="Revenue Today"
          value={`$${data.revenueToday.toLocaleString()}`}
          subtext="2hr updates"
          gradient="from-blue-500 via-blue-600 to-indigo-600"
        />

        {/* 6. Monthly Revenue */}
        <MetricCard
          icon={<TrendingUp className="w-full h-full text-white" />}
          label="Monthly Revenue"
          value={`$${data.revenueThisMonth.toLocaleString()}`}
          subtext="Resets Day 7"
          gradient="from-indigo-500 via-indigo-600 to-purple-600"
        />

        {/* 7. Investor Pool */}
        <MetricCard
          icon={<DollarSign className="w-full h-full text-white" />}
          label="Investor Pool"
          value={`$${data.investorPool.toLocaleString()}`}
          subtext={`Next: ${nextDistributionStr}`}
          gradient="from-amber-500 via-amber-600 to-orange-600"
        />

        {/* 8. CO₂ Saved */}
        <MetricCard
          icon={<Leaf className="w-full h-full text-white" />}
          label="CO₂ Saved"
          value={`${data.co2Saved} kg`}
          subtext={`🌳 ${Math.floor(data.co2Saved / 21)} trees`}
          gradient="from-green-500 via-green-600 to-emerald-600"
        />
      </div>
    </div>
  );
}
