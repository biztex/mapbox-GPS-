/**
 * Fleet Calculations Module
 * 
 * Business Rules:
 * - Revenue: $250-300/day/car (updated every 2 hours with realistic pattern)
 * - Trips: Average 14 trips/car/day (1-2 per hour, varies with rush hour)
 * - Passengers: 1-3 per trip
 * - Rush hours: 6-9 AM, 5-8 PM (fewer trips, more revenue/trip)
 * - Trips increase throughout the day (not all completed in morning)
 * - Maintenance: 3-4 cars rotate every 2-3 days (90-95% availability)
 * - Daily reset: tripsToday resets at midnight
 * - Monthly reset: revenueThisMonth, investorPool reset on Day 7
 */

export interface FleetData {
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
  lastMaintenanceRotation: string;
  currentMonth: number;
  currentDay: number;
  last2HourUpdate: string;
  lastUpdated: string;
  fleetComposition: {
    sedan: number;
    suv: number;
    luxury: number;
    electric: number;
    van: number;
  };
  carTrips?: Record<string, number>;
}

/**
 * Generate fuzzy random number (avoid sharp values)
 */
function fuzzyRandom(min: number, max: number): number {
  const base = min + Math.random() * (max - min);
  const noise = (Math.random() - 0.5) * 10; // Add ±5 variation
  return Math.round(base + noise);
}

/**
 * Check if current hour is rush hour
 */
function isRushHour(): boolean {
  const hour = new Date().getHours();
  return (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20);
}

/**
 * Get trip multiplier based on time of day
 * Morning (6-10): 0.6x trips, Midday (10-17): 1.0x, Evening (17-21): 0.7x, Night (21-6): 0.4x
 */
function getTripMultiplier(): number {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 0.6;  // Morning rush - fewer trips
  if (hour >= 10 && hour < 17) return 1.0;  // Midday - normal
  if (hour >= 17 && hour < 21) return 0.7;  // Evening rush - fewer trips
  return 0.4;  // Night - very few trips
}

/**
 * Calculate 2-hour updates (trips, passengers, revenue)
 * Updates every 2 hours
 * Average: 14 trips/car/day = ~1.17 trips/car/hour
 */
export function calculate2HourUpdates(data: FleetData): FleetData {
  const now = new Date();
  const nowISO = now.toISOString();
  const hour = now.getHours();
  const multiplier = getTripMultiplier();
  
  // Calculate trips for this 2-hour period
  // Base: 2.34 trips/car per 2 hours (14/day ÷ 6 periods)
  // Apply time-of-day multiplier
  const baseTripsPerCar = 2.34 * multiplier;
  
  let totalTrips = 0;
  let totalPassengers = 0;
  const carTrips = data.carTrips || {};
  
  // Each car gets different trip count
  for (let i = 0; i < data.activeCars; i++) {
    // Random variation ±30%
    const trips = Math.max(0, Math.round(baseTripsPerCar * (0.7 + Math.random() * 0.6)));
    totalTrips += trips;
    
    // Store individual car trips for display
    carTrips[`car_${i}`] = (carTrips[`car_${i}`] || 0) + trips;
    
    // Each trip has 1-3 passengers
    for (let j = 0; j < trips; j++) {
      totalPassengers += fuzzyRandom(1, 3);
    }
  }
  
  // Revenue calculation: $250-300/day/car
  // Divide by 6 (2-hour periods) and apply time-of-day variation
  const baseRevenuePerCar = (250 + Math.random() * 50) / 6;
  let totalRevenue = 0;
  
  for (let i = 0; i < data.activeCars; i++) {
    // Rush hours generate more revenue per trip (premium pricing)
    const rushMultiplier = isRushHour() ? 1.3 : 1.0;
    const revenue = Math.round(baseRevenuePerCar * rushMultiplier * (0.9 + Math.random() * 0.2));
    totalRevenue += revenue;
  }
  
  // CO2 saved: 1.5kg per trip
  const co2Increment = Math.round(totalTrips * 1.5);
  
  // Investor pool: grows with revenue (20% of 30% profit = 6% of revenue)
  const investorIncrement = Math.round(totalRevenue * 0.06);
  
  return {
    ...data,
    tripsToday: data.tripsToday + totalTrips,
    lifetimeTrips: data.lifetimeTrips + totalTrips,
    lifetimePassengers: data.lifetimePassengers + totalPassengers,
    revenueToday: data.revenueToday + totalRevenue,
    revenueThisMonth: data.revenueThisMonth + totalRevenue,
    investorPool: data.investorPool + investorIncrement,
    co2Saved: data.co2Saved + co2Increment,
    carTrips,
    last2HourUpdate: nowISO,
    lastUpdated: nowISO,
  };
}

/**
 * Check and perform daily reset (midnight)
 * Resets: tripsToday, revenueToday, carTrips
 * Keeps: lifetimeTrips, lifetimePassengers, revenueThisMonth
 */
export function checkDailyReset(data: FleetData): FleetData {
  const now = new Date();
  const currentDay = now.getDate();
  
  // Check if day changed
  if (currentDay !== data.currentDay) {
    return {
      ...data,
      tripsToday: 0,
      revenueToday: 0,
      carTrips: {},
      currentDay: currentDay,
      lastUpdated: now.toISOString(),
    };
  }
  
  return data;
}

/**
 * Check and perform monthly reset (Day 7)
 * Resets: revenueThisMonth, investorPool
 * Keeps: lifetimeTrips, lifetimePassengers
 */
export function checkMonthlyReset(data: FleetData): FleetData {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  
  // Check if it's the 7th and month changed
  if (currentDay === 7 && currentMonth !== data.currentMonth) {
    return {
      ...data,
      lastMonthDistribution: data.investorPool,
      totalDistributed: data.totalDistributed + data.investorPool,
      revenueThisMonth: 0,
      investorPool: 0,
      currentMonth: currentMonth,
      lastUpdated: now.toISOString(),
    };
  }
  
  return data;
}

/**
 * Rotate maintenance cars every 2-3 days
 * Maintains 90-95% fleet availability (27-28 active cars)
 */
export function rotateMaintenanceCars(data: FleetData): FleetData {
  const now = new Date();
  const lastRotation = new Date(data.lastMaintenanceRotation);
  const daysSinceRotation = Math.floor(
    (now.getTime() - lastRotation.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Rotate every 2-3 days
  if (daysSinceRotation >= 2) {
    // Random 3-4 cars in maintenance (ensures 27-28 active = 90-95% availability)
    const inMaintenance = Math.random() < 0.5 ? 3 : 4;
    const activeCars = data.totalFleet - data.inLicensing - inMaintenance;
    
    return {
      ...data,
      inMaintenance,
      activeCars,
      lastMaintenanceRotation: now.toISOString(),
      lastUpdated: now.toISOString(),
    };
  }
  
  return data;
}

/**
 * Check if 2-hour update is needed
 */
export function needs2HourUpdate(lastUpdate: string): boolean {
  const now = new Date();
  const last = new Date(lastUpdate);
  const hoursPassed = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  return hoursPassed >= 2;
}

/**
 * Format date for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-AE', {
    timeZone: 'Asia/Dubai',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

/**
 * Calculate fleet usage percentage
 */
export function calculateFleetUsage(data: FleetData): number {
  return Math.round((data.activeCars / data.totalFleet) * 100);
}
