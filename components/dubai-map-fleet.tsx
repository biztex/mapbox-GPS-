'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker, type ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Car {
  id: number;
  latitude: number;
  longitude: number;
  type: 'sedan' | 'suv' | 'taxi' | 'luxury';
  passengers: number;
  revenue: number;
  trips: number;
  // For route following
  routeIndex: number;
  waypointIndex: number;
  speed: number;
  // For hourly dynamic updates
  baseTrips: number;
  basePassengers: number;
  lastHourUpdate: number;
}

interface Landmark {
  id: number;
  latitude: number;
  longitude: number;
  type: 'office_tower' | 'hotel' | 'mall' | 'palm';
  name: string;
}

interface DubaiMapProps {
  totalFleet: number;
  inLicensing: number;
  inMaintenance: number;
  activeCars: number;
}

// Mapbox token from environment (get free token at https://account.mapbox.com/)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example_replace_with_your_token';

// Dubai coordinates
const DUBAI_CENTER = {
  latitude: 25.2048,
  longitude: 55.2708,
};

// Famous Dubai landmarks
const DUBAI_LANDMARKS: Landmark[] = [
  { id: 1, latitude: 25.1972, longitude: 55.2744, type: 'office_tower', name: 'Burj Khalifa' },
  { id: 2, latitude: 25.1304, longitude: 55.1860, type: 'hotel', name: 'Atlantis The Palm' },
  { id: 3, latitude: 25.1989, longitude: 55.2793, type: 'mall', name: 'Dubai Mall' },
  { id: 4, latitude: 25.2048, longitude: 55.2708, type: 'office_tower', name: 'DIFC' },
  { id: 5, latitude: 25.0763, longitude: 55.1391, type: 'palm', name: 'Palm Jumeirah' },
  { id: 6, latitude: 25.2388, longitude: 55.2923, type: 'hotel', name: 'Jumeirah Beach Hotel' },
  { id: 7, latitude: 25.1980, longitude: 55.2762, type: 'mall', name: 'Souk Al Bahar' },
  { id: 8, latitude: 25.2632, longitude: 55.3116, type: 'office_tower', name: 'Dubai Marina' },
];

// 25 Predefined routes around Dubai (inland only, avoiding water)
const DUBAI_ROUTES = [
  // Airport routes (updated to avoid water areas)
  { name: 'Airport → Dubai Mall', waypoints: [{lat: 25.2532, lng: 55.3657}, {lat: 25.2200, lng: 55.3100}, {lat: 25.1989, lng: 55.2793}] },
  { name: 'Airport → Dubai Marina', waypoints: [{lat: 25.2532, lng: 55.3657}, {lat: 25.2400, lng: 55.3200}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Airport → Burj Khalifa', waypoints: [{lat: 25.2532, lng: 55.3657}, {lat: 25.2200, lng: 55.3100}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'Airport → Media City', waypoints: [{lat: 25.2532, lng: 55.3657}, {lat: 25.1800, lng: 55.2400}, {lat: 25.0990, lng: 55.1710}] },
  
  // Dubai Mall routes (reduced from 4 to 2 routes)
  { name: 'Dubai Mall → Marina', waypoints: [{lat: 25.1989, lng: 55.2793}, {lat: 25.1500, lng: 55.2200}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Dubai Mall → JBR', waypoints: [{lat: 25.1989, lng: 55.2793}, {lat: 25.1400, lng: 55.2100}, {lat: 25.0770, lng: 55.1326}] },
  
  // Marina routes (updated to follow coast road to Palm entrance)
  { name: 'Marina → Palm Gateway', waypoints: [{lat: 25.0800, lng: 55.1400}, {lat: 25.0920, lng: 55.1370}, {lat: 25.1050, lng: 55.1380}, {lat: 25.1124, lng: 55.1380}] },
  { name: 'Marina → Downtown', waypoints: [{lat: 25.0800, lng: 55.1400}, {lat: 25.1200, lng: 55.1800}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'Marina → Media City', waypoints: [{lat: 25.0800, lng: 55.1400}, {lat: 25.0950, lng: 55.1520}, {lat: 25.0990, lng: 55.1710}] },
  
  // DIFC routes
  { name: 'DIFC → Burj Khalifa', waypoints: [{lat: 25.2048, lng: 55.2708}, {lat: 25.2010, lng: 55.2726}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'DIFC → Sheikh Zayed Road', waypoints: [{lat: 25.2048, lng: 55.2708}, {lat: 25.1800, lng: 55.2600}, {lat: 25.1500, lng: 55.2400}] },
  { name: 'DIFC → Trade Centre', waypoints: [{lat: 25.2048, lng: 55.2708}, {lat: 25.2200, lng: 55.2800}, {lat: 25.2290, lng: 55.2870}] },
  
  // Palm routes (CONSERVATIVE trunk road coordinates - central spine ONLY, stays on land!)
  { name: 'Palm Gateway → Atlantis', waypoints: [{lat: 25.1124, lng: 55.1380}, {lat: 25.1170, lng: 55.1485}, {lat: 25.1220, lng: 55.1595}, {lat: 25.1270, lng: 55.1720}, {lat: 25.1304, lng: 55.1860}] },
  
  // Business Bay routes (reduced from 2 to 1 route)
  { name: 'Business Bay → Al Quoz', waypoints: [{lat: 25.1870, lng: 55.2630}, {lat: 25.1600, lng: 55.2400}, {lat: 25.1380, lng: 55.2240}] },
  
  // Circular route (updated to follow main roads)
  { name: 'Dubai Circle Tour', waypoints: [{lat: 25.2532, lng: 55.3657}, {lat: 25.1989, lng: 55.2793}, {lat: 25.0800, lng: 55.1400}, {lat: 25.0990, lng: 55.1710}, {lat: 25.2532, lng: 55.3657}] },
  
  // West Side Routes (updated to follow main roads, avoiding water)
  { name: 'Ibn Battuta → Dubai Marina', waypoints: [{lat: 25.0443, lng: 55.1192}, {lat: 25.0600, lng: 55.1300}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Dubai Sports City → Motor City', waypoints: [{lat: 25.0420, lng: 55.2100}, {lat: 25.0550, lng: 55.2000}, {lat: 25.0680, lng: 55.1900}] },
  { name: 'Discovery Gardens → Marina', waypoints: [{lat: 25.0420, lng: 55.1300}, {lat: 25.0600, lng: 55.1350}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Dubai Production City → Al Barsha', waypoints: [{lat: 25.0300, lng: 55.1700}, {lat: 25.0800, lng: 55.1900}, {lat: 25.1200, lng: 55.2100}] },
  { name: 'Motor City → JBR', waypoints: [{lat: 25.0680, lng: 55.1900}, {lat: 25.0720, lng: 55.1600}, {lat: 25.0770, lng: 55.1326}] },
  
  // Mirdiff routes (updated to follow main roads)
  { name: 'Mirdiff → Media City', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.1800, lng: 55.3000}, {lat: 25.0990, lng: 55.1710}] },
  { name: 'Mirdiff → Downtown', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.2100, lng: 55.3400}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'Mirdiff → Dubai Mall', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.2000, lng: 55.3200}, {lat: 25.1989, lng: 55.2793}] },
  { name: 'Mirdiff → Marina', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.1500, lng: 55.2800}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Mirdiff → Airport', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.2400, lng: 55.3900}, {lat: 25.2532, lng: 55.3657}] },
  { name: 'Mirdiff → Silicon Oasis', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.1800, lng: 55.3800}, {lat: 25.1258, lng: 55.3906}] },
  { name: 'Mirdiff → Deira', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.2500, lng: 55.3600}, {lat: 25.2710, lng: 55.3100}] },
  { name: 'Mirdiff → Festival City', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.2200, lng: 55.3700}, {lat: 25.2228, lng: 55.3543}] },
  { name: 'Mirdiff → Business Bay', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.1900, lng: 55.3100}, {lat: 25.1870, lng: 55.2630}] },
  { name: 'Mirdiff → JBR', waypoints: [{lat: 25.2186, lng: 55.4101}, {lat: 25.1400, lng: 55.2500}, {lat: 25.0770, lng: 55.1326}] },
  
  // Dubai Hills & JVC routes (updated to follow main roads)
  { name: 'Dubai Hills → JVC', waypoints: [{lat: 25.0940, lng: 55.2450}, {lat: 25.0800, lng: 55.2300}, {lat: 25.0650, lng: 55.2180}] },
  { name: 'Dubai Hills → Downtown', waypoints: [{lat: 25.0940, lng: 55.2450}, {lat: 25.1400, lng: 55.2600}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'JVC → Marina', waypoints: [{lat: 25.0650, lng: 55.2180}, {lat: 25.0750, lng: 55.1800}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'JVC → Media City', waypoints: [{lat: 25.0650, lng: 55.2180}, {lat: 25.0800, lng: 55.1800}, {lat: 25.0990, lng: 55.1710}] },
  { name: 'Dubai Hills → Mall of Emirates', waypoints: [{lat: 25.0940, lng: 55.2450}, {lat: 25.1100, lng: 55.2100}, {lat: 25.1181, lng: 55.2006}] },
  { name: 'JVC → Motor City', waypoints: [{lat: 25.0650, lng: 55.2180}, {lat: 25.0670, lng: 55.2000}, {lat: 25.0680, lng: 55.1900}] },
  { name: 'Dubai Hills → Business Bay', waypoints: [{lat: 25.0940, lng: 55.2450}, {lat: 25.1400, lng: 55.2550}, {lat: 25.1870, lng: 55.2630}] },
  { name: 'JVC → JVT', waypoints: [{lat: 25.0650, lng: 55.2180}, {lat: 25.0500, lng: 55.1900}, {lat: 25.0440, lng: 55.1650}] },
  
  // Silicon Oasis & Expo routes (7 routes)
  { name: 'Silicon Oasis → Expo City', waypoints: [{lat: 25.1258, lng: 55.3906}, {lat: 25.1000, lng: 55.3300}, {lat: 25.0700, lng: 55.2700}] },
  { name: 'Silicon Oasis → Downtown', waypoints: [{lat: 25.1258, lng: 55.3906}, {lat: 25.1600, lng: 55.3300}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'Expo City → Marina', waypoints: [{lat: 25.0700, lng: 55.2700}, {lat: 25.0750, lng: 55.2000}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Expo City → Dubai Mall', waypoints: [{lat: 25.0700, lng: 55.2700}, {lat: 25.1300, lng: 55.2750}, {lat: 25.1989, lng: 55.2793}] },
  { name: 'Silicon Oasis → Airport', waypoints: [{lat: 25.1258, lng: 55.3906}, {lat: 25.1900, lng: 55.3800}, {lat: 25.2532, lng: 55.3657}] },
  { name: 'Expo 2020 → JVC', waypoints: [{lat: 25.0700, lng: 55.2700}, {lat: 25.0680, lng: 55.2400}, {lat: 25.0650, lng: 55.2180}] },
  { name: 'Silicon Oasis → Business Bay', waypoints: [{lat: 25.1258, lng: 55.3906}, {lat: 25.1560, lng: 55.3200}, {lat: 25.1870, lng: 55.2630}] },
  
  // JLT & JVT routes (updated to follow main roads)
  { name: 'JLT → Marina', waypoints: [{lat: 25.0704, lng: 55.1432}, {lat: 25.0750, lng: 55.1400}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'JLT → Downtown', waypoints: [{lat: 25.0704, lng: 55.1432}, {lat: 25.1300, lng: 55.2000}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'JVT → Marina', waypoints: [{lat: 25.0440, lng: 55.1650}, {lat: 25.0620, lng: 55.1500}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'JVT → Discovery Gardens', waypoints: [{lat: 25.0440, lng: 55.1650}, {lat: 25.0430, lng: 55.1450}, {lat: 25.0420, lng: 55.1300}] },
  { name: 'JLT → DIFC', waypoints: [{lat: 25.0704, lng: 55.1432}, {lat: 25.1400, lng: 55.2100}, {lat: 25.2048, lng: 55.2708}] },
  { name: 'JLT → Media City', waypoints: [{lat: 25.0704, lng: 55.1432}, {lat: 25.0850, lng: 55.1570}, {lat: 25.0990, lng: 55.1710}] },
  
  // Deira & Bur Dubai routes (5 routes)
  { name: 'Deira → Bur Dubai', waypoints: [{lat: 25.2710, lng: 55.3100}, {lat: 25.2500, lng: 55.2900}, {lat: 25.2480, lng: 55.2780}] },
  { name: 'Deira → Downtown', waypoints: [{lat: 25.2710, lng: 55.3100}, {lat: 25.2300, lng: 55.2900}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'Bur Dubai → Dubai Mall', waypoints: [{lat: 25.2480, lng: 55.2780}, {lat: 25.2200, lng: 55.2780}, {lat: 25.1989, lng: 55.2793}] },
  { name: 'Deira → Airport', waypoints: [{lat: 25.2710, lng: 55.3100}, {lat: 25.2620, lng: 55.3400}, {lat: 25.2532, lng: 55.3657}] },
  { name: 'Bur Dubai → Marina', waypoints: [{lat: 25.2480, lng: 55.2780}, {lat: 25.1600, lng: 55.2100}, {lat: 25.0800, lng: 55.1400}] },
  
  // Jumeirah routes (updated to follow main roads)
  { name: 'Jumeirah 1 → Downtown', waypoints: [{lat: 25.2155, lng: 55.2485}, {lat: 25.2060, lng: 55.2620}, {lat: 25.1972, lng: 55.2744}] },
  { name: 'Jumeirah 2 → Marina', waypoints: [{lat: 25.1832, lng: 55.2368}, {lat: 25.1300, lng: 55.1900}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Jumeirah 3 → Media City', waypoints: [{lat: 25.1510, lng: 55.2250}, {lat: 25.1250, lng: 55.1850}, {lat: 25.0990, lng: 55.1710}] },
  { name: 'Jumeirah → DIFC', waypoints: [{lat: 25.2155, lng: 55.2485}, {lat: 25.2100, lng: 55.2600}, {lat: 25.2048, lng: 55.2708}] },
  { name: 'Jumeirah → Business Bay', waypoints: [{lat: 25.1832, lng: 55.2368}, {lat: 25.1850, lng: 55.2500}, {lat: 25.1870, lng: 55.2630}] },
  
  // Al Maktoum Airport routes (updated to follow main roads, avoiding water)
  { name: 'Al Maktoum Airport → Marina', waypoints: [{lat: 24.8967, lng: 55.1611}, {lat: 25.0200, lng: 55.1500}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Al Maktoum Airport → Discovery Gardens', waypoints: [{lat: 24.8967, lng: 55.1611}, {lat: 25.0100, lng: 55.1400}, {lat: 25.0420, lng: 55.1300}] },
  { name: 'Al Maktoum Airport → Expo City', waypoints: [{lat: 24.8967, lng: 55.1611}, {lat: 25.0000, lng: 55.2200}, {lat: 25.0700, lng: 55.2700}] },
  
  // Damac Hills & Other routes (6 routes)
  { name: 'Damac Hills 2 → Motor City', waypoints: [{lat: 25.0380, lng: 55.2050}, {lat: 25.0530, lng: 55.1980}, {lat: 25.0680, lng: 55.1900}] },
  { name: 'Damac Hills 2 → Dubai Hills', waypoints: [{lat: 25.0380, lng: 55.2050}, {lat: 25.0660, lng: 55.2250}, {lat: 25.0940, lng: 55.2450}] },
  { name: 'Business Bay → Trade Centre', waypoints: [{lat: 25.1870, lng: 55.2630}, {lat: 25.2070, lng: 55.2750}, {lat: 25.2290, lng: 55.2870}] },
  { name: 'Mall of Emirates → Marina', waypoints: [{lat: 25.1181, lng: 55.2006}, {lat: 25.0990, lng: 55.1710}, {lat: 25.0800, lng: 55.1400}] },
  { name: 'Sheikh Zayed Road Corridor', waypoints: [{lat: 25.2290, lng: 55.2870}, {lat: 25.2048, lng: 55.2708}, {lat: 25.1870, lng: 55.2630}, {lat: 25.1181, lng: 55.2006}] },
  { name: 'Media City → Marina → JBR Loop', waypoints: [{lat: 25.0990, lng: 55.1710}, {lat: 25.0800, lng: 55.1400}, {lat: 25.0770, lng: 55.1326}] },
];

export default function DubaiMapFleet({ totalFleet, inLicensing, inMaintenance, activeCars }: DubaiMapProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [viewport, setViewport] = useState({
    latitude: DUBAI_CENTER.latitude,
    longitude: DUBAI_CENTER.longitude,
    zoom: 11.5,
  });
  const mapRef = useRef(null);

  // Initialize cars across different routes
  useEffect(() => {
    const carTypes: Array<'sedan' | 'suv' | 'taxi' | 'luxury'> = ['sedan', 'suv', 'taxi', 'luxury'];
    const currentHour = new Date().getHours();
    
    // Calculate expected trips at this hour (progressive throughout day)
    // Average 14 trips/day = 0.58 trips/hour
    // By current hour, each car should have completed: hour * 0.58 trips (with variation)
    const getTripsForHour = (hour: number, carIndex: number) => {
      const baseRate = 0.58; // Average trips per hour
      const expectedTrips = hour * baseRate;
      // Add car-specific variation (±30%)
      const carVariation = (carIndex % 10) / 10; // 0.0 to 0.9
      const variation = 0.7 + (carVariation * 0.6); // 0.7 to 1.3
      return Math.max(0, Math.round(expectedTrips * variation));
    };
    
    const initialCars: Car[] = Array.from({ length: activeCars }, (_, i) => {
      // Assign car to a route (distribute evenly across all routes)
      const routeIndex = i % DUBAI_ROUTES.length;
      const route = DUBAI_ROUTES[routeIndex];
      
      // Start at a random position along the route for dispersion
      const waypointIndex = Math.floor(Math.random() * route.waypoints.length);
      const startWaypoint = route.waypoints[waypointIndex];
      
      const tripsNow = getTripsForHour(currentHour, i);
      const passengersNow = Math.round(tripsNow * (1.5 + Math.random() * 0.6)); // 1.5-2.1 passengers per trip
      const revenueNow = Math.round((250 + Math.random() * 50) * (tripsNow / 14)); // Proportional to trips
      
      return {
        id: i,
        latitude: startWaypoint.lat,
        longitude: startWaypoint.lng,
        type: carTypes[i % carTypes.length],
        passengers: passengersNow,
        revenue: revenueNow,
        trips: tripsNow,
        routeIndex: routeIndex,
        waypointIndex: waypointIndex,
        speed: 0.00008 + Math.random() * 0.00006,
        baseTrips: 0, // Not used anymore
        basePassengers: 0,
        lastHourUpdate: currentHour,
      };
    });
    
    setCars(initialCars);
  }, [activeCars]);

  // Dynamic hourly updates for trips and passengers (with midnight reset)
  useEffect(() => {
    const hourlyCheck = setInterval(() => {
      const currentHour = new Date().getHours();
      
      setCars(prevCars =>
        prevCars.map(car => {
          // Check if hour changed
          if (currentHour !== car.lastHourUpdate) {
            // Midnight reset (hour 0)
            if (currentHour === 0) {
              return {
                ...car,
                trips: 0,
                passengers: 0,
                revenue: 0,
                lastHourUpdate: currentHour,
              };
            }
            
            // Hourly increment: 0.58 trips/hour average (14 trips/day ÷ 24 hours)
            // Add variation per car (0.3-0.9 trips this hour)
            const carVariation = (car.id % 10) / 10;
            const tripsThisHour = Math.random() < (0.58 * (0.7 + carVariation * 0.6)) ? 1 : 0;
            const passengersThisHour = tripsThisHour * Math.round(1.5 + Math.random() * 0.6); // 1.5-2.1 per trip
            const revenueThisHour = Math.round((250 + Math.random() * 50) / 24); // Daily revenue ÷ 24 hours
            
            return {
              ...car,
              trips: car.trips + tripsThisHour,
              passengers: car.passengers + passengersThisHour,
              revenue: car.revenue + revenueThisHour,
              lastHourUpdate: currentHour,
            };
          }
          
          return car;
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(hourlyCheck);
  }, []);

  // Animate cars - follow assigned routes
  useEffect(() => {
    const interval = setInterval(() => {
      setCars(prevCars =>
        prevCars.map(car => {
          const route = DUBAI_ROUTES[car.routeIndex];
          const currentWaypoint = route.waypoints[car.waypointIndex];
          
          // Calculate distance to current waypoint
          const latDiff = currentWaypoint.lat - car.latitude;
          const lonDiff = currentWaypoint.lng - car.longitude;
          const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
          
          // If close to waypoint, move to next waypoint in route
          if (distance < 0.002) {
            const nextWaypointIndex = (car.waypointIndex + 1) % route.waypoints.length;
            return {
              ...car,
              waypointIndex: nextWaypointIndex,
            };
          }
          
          // Move towards current waypoint smoothly
          const moveRatio = car.speed / distance;
          return {
            ...car,
            latitude: car.latitude + latDiff * moveRatio,
            longitude: car.longitude + lonDiff * moveRatio,
          };
        })
      );
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  // Calculate fleet usage percentage
  const fleetUsage = Math.round((activeCars / totalFleet) * 100);
  const currentDate = new Date().toLocaleDateString('en-AE', { 
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card className="p-2 bg-white dark:bg-gray-800 shadow-xl border border-amber-300">
      <div className="mb-2">
        <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">
          🗺️ Gulf-EL Fleet Status
        </h3>
        <div className="text-[10px] text-gray-700 dark:text-gray-300 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Total Fleet: {totalFleet} cars</span>
            <span className="text-gray-500">|</span>
            <span className="text-amber-600">{inLicensing} in Licensing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Active Today ({currentDate}): {activeCars} cars</span>
            <span className="text-gray-500">|</span>
            <span className="text-orange-600">{inMaintenance} in Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Fleet Usage:</span>
            <Badge className="bg-green-500 text-white text-[9px] px-1.5 py-0">
              {fleetUsage}% Online
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="relative h-[450px] rounded-lg overflow-hidden border-2 border-amber-400">
        <Map
          {...viewport}
          onMove={(evt: ViewStateChangeEvent) => setViewport(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Landmarks */}
          {DUBAI_LANDMARKS.map(landmark => (
            <Marker
              key={`landmark-${landmark.id}`}
              latitude={landmark.latitude}
              longitude={landmark.longitude}
              anchor="bottom"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-8 h-8 bg-white rounded-full shadow-lg border-2 border-amber-500 flex items-center justify-center">
                  <Image
                    src={`/icons/${landmark.type}.svg`}
                    alt={landmark.type}
                    width={20}
                    height={20}
                    className="opacity-80"
                  />
                </div>
                <div className="text-[8px] font-bold text-gray-800 bg-white px-1 rounded shadow mt-0.5">
                  {landmark.name}
                </div>
              </div>
            </Marker>
          ))}

          {/* Cars */}
          {cars.map(car => (
            <Marker
              key={`car-${car.id}`}
              latitude={car.latitude}
              longitude={car.longitude}
              anchor="center"
            >
              <div className="relative group cursor-pointer">
                <div className="relative w-10 h-10 bg-emerald-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center transform transition-transform group-hover:scale-125">
                  <Image
                    src={`/icons/${car.type}.svg`}
                    alt={car.type}
                    width={24}
                    height={24}
                    className="fill-white"
                  />
                  {car.passengers > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                      {car.passengers}
                    </div>
                  )}
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <div className="bg-gray-900 text-white text-[9px] px-2 py-1 rounded shadow-lg">
                    <div>💰 ${car.revenue}/day</div>
                    <div>🎯 {car.trips} trips</div>
                    <div>👥 {car.passengers} passengers</div>
                  </div>
                </div>
              </div>
            </Marker>
          ))}
        </Map>
      </div>
      
      <div className="mt-2 text-center text-[9px] text-amber-700 dark:text-amber-400">
        <p>📍 Real Dubai Streets • Live GPS Tracking</p>
      </div>
    </Card>
  );
}
