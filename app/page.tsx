import ROICalculator from '@/components/roi-calculator';
import TierTable from '@/components/tier-table';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d2438] to-[#1a3a3a] py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Header - Minimized by 50% */}
        <div className="text-center space-y-1 mb-3">
          <h1 className="text-lg md:text-xl font-bold text-white">
            ROI Staking Calculator
          </h1>
          <p className="text-[10px] text-gray-300 max-w-2xl mx-auto">
            Calculate your potential returns based on our 4-tier staking system
          </p>
        </div>

        <ROICalculator />
        
        {/* 1mm spacing */}
        <div className="h-[1mm]"></div>
        
        <TierTable />
      </div>
    </main>
  );
}
