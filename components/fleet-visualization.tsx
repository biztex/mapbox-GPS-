'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

interface FleetData {
  totalFleet: number;
  activeCars: number;
  revenueToday: number;
  revenueThisMonth: number;
  investorPool: number;
  lifetimeTrips: number;
  lifetimePassengers: number;
  co2Saved: number;
}

interface Car {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  rotation: number;
  color: string;
  passengers: number;
  emoji: string;
}

interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'tower' | 'hotel' | 'mall' | 'palm';
  emoji: string;
}

export default function FleetVisualization({ data }: { data: FleetData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const animationRef = useRef<number | null>(null);

  // Initialize Dubai-style buildings and landmarks
  useEffect(() => {
    const dubaiBuildings: Building[] = [
      // Top row - Iconic towers
      { x: 50, y: 20, width: 70, height: 80, type: 'tower', emoji: '🏙️' },
      { x: 200, y: 15, width: 60, height: 90, type: 'tower', emoji: '🏛️' },
      { x: 350, y: 20, width: 75, height: 85, type: 'hotel', emoji: '🏨' },
      { x: 520, y: 15, width: 65, height: 95, type: 'tower', emoji: '🕌' },
      
      // Middle row - Mixed
      { x: 40, y: 180, width: 80, height: 70, type: 'mall', emoji: '🏬' },
      { x: 180, y: 190, width: 50, height: 55, type: 'palm', emoji: '🌴' },
      { x: 340, y: 185, width: 85, height: 75, type: 'hotel', emoji: '🏩' },
      { x: 510, y: 180, width: 55, height: 65, type: 'palm', emoji: '🌴' },
      
      // Bottom row
      { x: 55, y: 340, width: 70, height: 60, type: 'mall', emoji: '🛍️' },
      { x: 195, y: 345, width: 75, height: 70, type: 'tower', emoji: '🏗️' },
      { x: 355, y: 338, width: 60, height: 65, type: 'palm', emoji: '🌴' },
      { x: 520, y: 340, width: 70, height: 68, type: 'hotel', emoji: '🏨' },
    ];
    
    setBuildings(dubaiBuildings);
  }, []);

  // Initialize cars with LARGE visible cars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const carEmojis = ['🚗', '🚕', '🚙', '🚐', '🚘'];
    const carColors = [
      '#10b981', // emerald
      '#f59e0b', // amber
      '#3b82f6', // blue
      '#ef4444', // red
      '#8b5cf6', // purple
      '#14b8a6', // teal
    ];

    const numCars = Math.min(data.activeCars || 27, 30);
    const initialCars: Car[] = Array.from({ length: numCars }, (_, i) => ({
      id: i,
      x: 100 + (i * 80) % 450,
      y: 150 + Math.floor(i / 6) * 100,
      targetX: 100 + Math.random() * 450,
      targetY: 150 + Math.random() * 250,
      speed: 1.5 + Math.random() * 1.5,
      rotation: 0,
      color: carColors[i % carColors.length],
      passengers: Math.floor(1 + Math.random() * 4),
      emoji: carEmojis[i % carEmojis.length],
    }));

    setCars(initialCars);
  }, [data.activeCars]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const animate = () => {
      // Clear canvas with Dubai sand color
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road network
      drawDubaiRoads(ctx, canvas.width, canvas.height);

      // Draw buildings
      buildings.forEach(building => drawDubaiBuilding(ctx, building));

      // Update and draw cars (AFTER everything else so they're on top)
      setCars(prevCars => {
        const updatedCars = prevCars.map(car => {
          let newCar = { ...car };

          // Calculate distance to target
          const dx = car.targetX - car.x;
          const dy = car.targetY - car.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Update rotation
          newCar.rotation = Math.atan2(dy, dx);

          if (distance < 10) {
            // Pick new target
            newCar.targetX = 50 + Math.random() * (canvas.width - 100);
            newCar.targetY = 120 + Math.random() * (canvas.height - 150);
          } else {
            // Move towards target
            const moveX = (dx / distance) * car.speed;
            const moveY = (dy / distance) * car.speed;
            newCar.x += moveX;
            newCar.y += moveY;
          }

          return newCar;
        });

        // Draw all cars
        updatedCars.forEach(car => {
          drawVisibleCar(ctx, car);
        });

        return updatedCars;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [buildings]);

  const drawDubaiRoads = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Main roads - golden/beige color
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';

    ctx.beginPath();
    
    // Horizontal roads (3 main)
    const horizontalRoads = [140, 260, 380];
    horizontalRoads.forEach(y => {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    });
    
    // Vertical roads (4 main)
    const verticalRoads = [130, 270, 410, 550];
    verticalRoads.forEach(x => {
      ctx.moveTo(x, 110);
      ctx.lineTo(x, height);
    });
    
    ctx.stroke();

    // White center lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);
    
    ctx.beginPath();
    horizontalRoads.forEach(y => {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    });
    verticalRoads.forEach(x => {
      ctx.moveTo(x, 110);
      ctx.lineTo(x, height);
    });
    ctx.stroke();
    
    ctx.setLineDash([]);
  };

  const drawDubaiBuilding = (ctx: CanvasRenderingContext2D, building: Building) => {
    // Building body with gradient
    const gradient = ctx.createLinearGradient(
      building.x, 
      building.y, 
      building.x, 
      building.y + building.height
    );
    
    if (building.type === 'tower') {
      gradient.addColorStop(0, '#cbd5e1');
      gradient.addColorStop(1, '#94a3b8');
    } else if (building.type === 'palm') {
      gradient.addColorStop(0, '#86efac');
      gradient.addColorStop(1, '#22c55e');
    } else {
      gradient.addColorStop(0, '#e2e8f0');
      gradient.addColorStop(1, '#cbd5e1');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(building.x, building.y, building.width, building.height);
    
    // Border
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(building.x, building.y, building.width, building.height);
    
    // Windows for towers/hotels
    if (building.type === 'tower' || building.type === 'hotel') {
      ctx.fillStyle = '#475569';
      const rows = Math.floor(building.height / 12);
      const cols = Math.floor(building.width / 12);
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          ctx.fillRect(
            building.x + 4 + col * 12,
            building.y + 4 + row * 12,
            6,
            6
          );
        }
      }
    }
    
    // Large emoji on top
    ctx.font = '24px Arial';
    ctx.fillText(
      building.emoji,
      building.x + building.width / 2 - 12,
      building.y - 8
    );
  };

  const drawVisibleCar = (ctx: CanvasRenderingContext2D, car: Car) => {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.rotation);

    // Draw LARGE car body
    ctx.fillStyle = car.color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Main car shape - MUCH LARGER
    ctx.fillRect(-20, -12, 40, 24);
    
    // Car front
    ctx.fillStyle = car.color + 'dd';
    ctx.fillRect(12, -12, 8, 24);
    
    // Windows
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(-12, -8, 10, 16);
    ctx.fillRect(4, -8, 8, 16);

    // Wheels
    ctx.fillStyle = '#1f2937';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(-10, 14, 4, 0, Math.PI * 2);
    ctx.arc(10, 14, 4, 0, Math.PI * 2);
    ctx.arc(-10, -14, 4, 0, Math.PI * 2);
    ctx.arc(10, -14, 4, 0, Math.PI * 2);
    ctx.fill();

    // Large emoji on top of car
    ctx.shadowBlur = 0;
    ctx.font = '28px Arial';
    ctx.fillText(car.emoji, -14, -20);

    // Passenger count badge
    if (car.passengers > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(24, -16, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(car.passengers.toString(), 24, -12);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 dark:bg-gray-800/90 backdrop-blur shadow-2xl border-2 border-amber-300">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-2xl">🏙️</span>
        <h3 className="text-base font-bold text-amber-800 dark:text-amber-400">
          Dubai Fleet - Live Operations
        </h3>
      </div>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-700 dark:to-gray-800 border-2 border-amber-400 shadow-inner">
        <canvas
          ref={canvasRef}
          width={650}
          height={450}
          className="w-full h-auto"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>
      <div className="mt-3 text-center text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
        <span>🌴</span>
        <p>Real-time Dubai Operations • Green & Sustainable</p>
        <span>🌴</span>
      </div>
    </Card>
  );
}
