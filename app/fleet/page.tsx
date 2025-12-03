'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FleetMetricsCompact from '@/components/fleet-metrics-compact';
import ROICalculator from '@/components/roi-calculator';
import { MapPin } from 'lucide-react';
// Fleet calculations now handled automatically by API

// Dynamically import map to avoid SSR issues
const DubaiMapFleet = dynamic(() => import('@/components/dubai-map-fleet'), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-sm text-gray-600">Loading Dubai Map...</p>
    </div>
  ),
});

// Dynamically import video presentation
const VideoPresentation = dynamic(() => import('@/components/video-presentation'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-900 rounded-lg flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading video...</p>
    </div>
  ),
});

export default function FleetPage() {
  const [fleetData, setFleetData] = useState({
    totalFleet: 30,
    inLicensing: 5,
    inMaintenance: 4,
    activeCars: 21,
    tripsToday: 0,
    lifetimeTrips: 250,
    lifetimePassengers: 500,
    revenueToday: 0,
    revenueThisMonth: 0,
    investorPool: 0,
    lastMonthDistribution: 14500,
    totalDistributed: 87000,
    co2Saved: 375,
    lastMaintenanceRotation: new Date().toISOString(),
    currentMonth: new Date().getMonth(),
    currentDay: new Date().getDate(),
    last2HourUpdate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    fleetComposition: {
      sedan: 10,
      suv: 3,
      luxury: 4,
      electric: 10,
      van: 3,
    },
  });

  // Fetch fleet data from API (which handles automatic updates)
  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        const response = await fetch('/api/fleet/data');
        if (response.ok) {
          const data = await response.json();
          setFleetData(data);
        }
      } catch (error) {
        console.error('Error fetching fleet data:', error);
      }
    };

    // Initial fetch
    fetchFleetData();

    // Refresh every 5 minutes to catch updates
    const interval = setInterval(fetchFleetData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Header */}
        {/* <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img 
              src="/gulf-el-logo.png" 
              alt="Gulf-El" 
              className="h-8 w-auto drop-shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
              Gulf-El Dubai Fleet
            </h1>
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400">
            <MapPin className="h-3 w-3" />
            <p className="text-[10px] font-semibold">Live from Dubai, UAE • Smart Green Transportation</p>
          </div>
        </div> */}

        {/* Main Content - Two Column Grid with Aligned Bottoms */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Left: Fleet Map + Breakdown Below */}
          <div className="space-y-4">
            <DubaiMapFleet 
              totalFleet={fleetData.totalFleet || 30} 
              inLicensing={fleetData.inLicensing || 5}
              inMaintenance={fleetData.inMaintenance || 4}
              activeCars={fleetData.activeCars || 21} 
            />
            
            {/* Fleet Breakdown Section - UNDER MAP */}
            <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/10 dark:to-orange-900/10 border-2 border-amber-300 rounded-lg shadow-md">
              <h3 className="text-center text-sm font-bold text-amber-800 dark:text-amber-400 mb-2">
                Active Fleet Breakdown
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <span className="text-lg">🚗</span>
                  <span className="font-semibold">Sedan (10)</span>
                </div>
                <span className="text-amber-500">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg">⚡</span>
                  <span className="font-semibold">Electric (10)</span>
                </div>
                <span className="text-amber-500">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg">🚙</span>
                  <span className="font-semibold">SUV (3)</span>
                </div>
                <span className="text-amber-500">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg">💎</span>
                  <span className="font-semibold">Luxury (4)</span>
                </div>
                <span className="text-amber-500">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg">🚐</span>
                  <span className="font-semibold">Van (3)</span>
                </div>
              </div>
              <p className="text-center text-[10px] text-gray-600 dark:text-gray-400 mt-2">
                Total: 30 vehicles | {fleetData.activeCars || 21} active today
              </p>
            </div>
          </div>

          {/* Right: Metrics + Video (Minimized) */}
          <div className="space-y-4">
            {/* Metrics Cards */}
            <FleetMetricsCompact data={fleetData} />

            {/* Video Presentation Section */}
            <div className="bg-gradient-to-r from-amber-900/20 via-orange-900/20 to-amber-900/20 rounded-lg border-2 border-amber-300/50 overflow-hidden shadow-lg">
              <div className="p-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600">
                <h3 className="text-center text-sm font-bold text-white">
                  Our Fleet in Action
                </h3>
              </div>
              <div className="p-0">
                <VideoPresentation />
              </div>
            </div>
          </div>
        </div>

        {/* ROI Calculator Section */}
        {/* <div className="mt-8 pt-6 border-t-2 border-amber-300">
          <div className="text-center mb-4">
            <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700 mb-1">
              Investment Calculator
            </h2>
            <p className="text-[10px] text-gray-700 dark:text-gray-300 font-medium">
              Calculate your potential returns with Gulf-El Dubai Fleet
            </p>
          </div>
          <ROICalculator />
        </div> */}
      </div>
    </div>
  );
}
