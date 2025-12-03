'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Navigation, Leaf, Star, Calendar, Target } from 'lucide-react';

interface FleetData {
  totalFleet: number;
  inLicensing: number;
  inMaintenance: number;
  activeCars: number;
  tripsToday: number;
  lifetimeTrips: number;
  lifetimePassengers: number;
  revenueToday: number;
  revenueThisMonth: number;
  investorPool: number;
  lastMonthDistribution: number;
  totalDistributed: number;
  co2Saved: number;
  lastUpdated: string;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  gradient: string;
  animate?: boolean;
}

function MetricCard({ icon, label, value, subtext, gradient, animate = false }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animate && typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value, animate]);

  const finalValue = animate && typeof value === 'number' ? displayValue : value;

  return (
    <Card className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2.5 bg-white/30 rounded-xl backdrop-blur-sm shadow-lg">
            {icon}
          </div>
          {subtext && (
            <Badge className="bg-white/40 text-white border-0 font-semibold text-xs shadow-md backdrop-blur-sm">
              {subtext}
            </Badge>
          )}
        </div>
        <h3 className="text-xs font-semibold text-white/90 mb-1 tracking-wide uppercase">{label}</h3>
        <p className="text-3xl font-black text-white drop-shadow-lg">{finalValue}</p>
      </div>
    </Card>
  );
}

export default function FleetMetrics({ data }: { data: FleetData }) {
  // Calculate next distribution date (7th of next month)
  const now = new Date();
  const nextDistribution = new Date(now.getFullYear(), now.getMonth() + 1, 7);
  const nextDistributionStr = nextDistribution.toLocaleDateString('en-AE', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
          Today's Performance
        </h2>
        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Fleet Active */}
        <MetricCard
          icon={<Navigation className="h-6 w-6 text-white" />}
          label="Fleet Active"
          value={`${data.activeCars}/${data.totalFleet}`}
          subtext="Random"
          gradient="from-emerald-500 via-emerald-600 to-teal-600"
        />

        {/* 2. Trips Today */}
        <MetricCard
          icon={<Navigation className="h-6 w-6 text-white" />}
          label="Trips Today"
          value={data.tripsToday.toLocaleString()}
          subtext="2hr updates"
          gradient="from-teal-500 via-teal-600 to-cyan-600"
          animate
        />

        {/* 3. Total Trips */}
        <MetricCard
          icon={<Navigation className="h-6 w-6 text-white" />}
          label="Total Trips"
          value={data.lifetimeTrips.toLocaleString()}
          subtext="All Time"
          gradient="from-cyan-500 via-cyan-600 to-sky-600"
          animate
        />

        {/* 4. Total Passengers */}
        <MetricCard
          icon={<Users className="h-6 w-6 text-white" />}
          label="Total Passengers"
          value={data.lifetimePassengers.toLocaleString()}
          subtext="All Time"
          gradient="from-sky-500 via-sky-600 to-blue-600"
          animate
        />

        {/* 5. Revenue Today */}
        <MetricCard
          icon={<DollarSign className="h-6 w-6 text-white" />}
          label="Revenue Today"
          value={`$${data.revenueToday.toLocaleString()}`}
          subtext="2hr updates"
          gradient="from-blue-500 via-blue-600 to-indigo-600"
        />

        {/* 6. Total Monthly Revenue */}
        <MetricCard
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          label="Monthly Revenue"
          value={`$${data.revenueThisMonth.toLocaleString()}`}
          subtext="Resets Day 7"
          gradient="from-indigo-500 via-indigo-600 to-purple-600"
        />

        {/* 7. Investor Pool */}
        <MetricCard
          icon={<Target className="h-6 w-6 text-white" />}
          label="Investor Pool"
          value={`$${data.investorPool.toLocaleString()}`}
          subtext={`Next: ${nextDistributionStr}`}
          gradient="from-amber-500 via-amber-600 to-orange-600"
        />

        {/* 8. CO2 Saved */}
        <MetricCard
          icon={<Leaf className="h-6 w-6 text-white" />}
          label="CO₂ Saved"
          value={`${data.co2Saved.toLocaleString()} kg`}
          subtext={`🌳 ${Math.floor(data.co2Saved / 21)} trees`}
          gradient="from-green-500 via-green-600 to-emerald-600"
        />
      </div>
    </div>
  );
}
