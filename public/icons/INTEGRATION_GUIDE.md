# Integration Guide: Dubai Fleet Tracking Icons

## Quick Start

All icons are now available in `/public/icons/` and ready to use in your Next.js application.

## 1. Basic Usage in React Components

```tsx
// Simple img tag
<img 
  src="/icons/sedan.svg" 
  alt="Sedan" 
  className="w-10 h-10 text-blue-500"
/>

// Next.js Image component
import Image from 'next/image';

<Image 
  src="/icons/car_top_view.svg"
  alt="Car"
  width={40}
  height={40}
  className="text-red-500"
/>
```

## 2. Map Integration Example

```tsx
import { useEffect, useRef } from 'react';

const FleetMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Example with Leaflet or Google Maps
    const carMarker = L.marker([25.2048, 55.2708], {
      icon: L.icon({
        iconUrl: '/icons/car_top_view.svg',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })
    });

    // Add to map
    carMarker.addTo(map);
  }, []);

  return <div ref={mapRef} className="w-full h-screen" />;
};
```

## 3. Dynamic Vehicle Types

```tsx
const VehicleMarker = ({ type, position, color }) => {
  const iconMap = {
    sedan: '/icons/sedan.svg',
    suv: '/icons/suv.svg',
    taxi: '/icons/taxi.svg',
    luxury: '/icons/luxury.svg',
    default: '/icons/car_top_view.svg'
  };

  return (
    <img 
      src={iconMap[type] || iconMap.default}
      alt={type}
      className={`w-10 h-10 ${color}`}
      style={{ 
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
};
```

## 4. Landmark Markers

```tsx
const landmarks = [
  { 
    name: 'Burj Khalifa', 
    icon: '/icons/office_tower.svg',
    position: [25.1972, 55.2744],
    color: 'text-blue-600'
  },
  { 
    name: 'Atlantis Hotel', 
    icon: '/icons/hotel.svg',
    position: [25.1308, 55.1177],
    color: 'text-purple-600'
  },
  { 
    name: 'Dubai Mall', 
    icon: '/icons/mall.svg',
    position: [25.1975, 55.2796],
    color: 'text-green-600'
  },
  { 
    name: 'Palm Jumeirah', 
    icon: '/icons/palm_tree.svg',
    position: [25.1124, 55.1390],
    color: 'text-green-500'
  }
];

const LandmarkLayer = () => (
  <>
    {landmarks.map((landmark, idx) => (
      <Marker 
        key={idx}
        position={landmark.position}
        icon={customIcon(landmark.icon, landmark.color)}
      >
        <Popup>{landmark.name}</Popup>
      </Marker>
    ))}
  </>
);
```

## 5. Animated Vehicle Movement

```tsx
const AnimatedVehicle = ({ path, speed }) => {
  const [position, setPosition] = useState(path[0]);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Animate vehicle along path
    const interval = setInterval(() => {
      // Update position and rotation based on path
      // ...
    }, speed);

    return () => clearInterval(interval);
  }, [path, speed]);

  return (
    <img 
      src="/icons/car_top_view.svg"
      alt="Vehicle"
      className="w-10 h-10 text-blue-500 transition-all duration-300"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`
      }}
    />
  );
};
```

## 6. Color Customization

All icons use `currentColor`, so you can easily theme them:

```tsx
// Tailwind CSS classes
<img src="/icons/sedan.svg" className="text-red-500" />
<img src="/icons/suv.svg" className="text-blue-600" />
<img src="/icons/taxi.svg" className="text-yellow-500" />

// Inline styles
<img 
  src="/icons/luxury.svg" 
  style={{ color: '#FFD700' }} 
/>

// CSS variables
<img 
  src="/icons/car_top_view.svg" 
  style={{ color: 'var(--primary-color)' }} 
/>
```

## 7. Fleet Status Indicators

```tsx
const FleetVehicle = ({ vehicle }) => {
  const statusColors = {
    active: 'text-green-500',
    idle: 'text-yellow-500',
    offline: 'text-gray-400',
    alert: 'text-red-500'
  };

  return (
    <div className="relative">
      <img 
        src={`/icons/${vehicle.type}.svg`}
        className={`w-12 h-12 ${statusColors[vehicle.status]}`}
        alt={vehicle.type}
      />
      {vehicle.status === 'alert' && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
    </div>
  );
};
```

## 8. Responsive Sizing

```tsx
// Mobile-first responsive icons
<img 
  src="/icons/sedan.svg"
  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
/>

// Based on zoom level
const getIconSize = (zoomLevel) => {
  if (zoomLevel < 12) return 30;
  if (zoomLevel < 15) return 40;
  return 50;
};
```

## 9. Performance Optimization

```tsx
// Preload icons
useEffect(() => {
  const icons = [
    '/icons/sedan.svg',
    '/icons/suv.svg',
    '/icons/taxi.svg',
    '/icons/luxury.svg',
    '/icons/car_top_view.svg'
  ];

  icons.forEach(icon => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = icon;
    document.head.appendChild(link);
  });
}, []);
```

## 10. TypeScript Types

```typescript
type VehicleType = 'sedan' | 'suv' | 'taxi' | 'luxury';
type LandmarkType = 'office_tower' | 'hotel' | 'mall' | 'palm_tree';

interface Vehicle {
  id: string;
  type: VehicleType;
  position: [number, number];
  status: 'active' | 'idle' | 'offline' | 'alert';
  rotation: number;
}

interface Landmark {
  id: string;
  name: string;
  type: LandmarkType;
  position: [number, number];
}
```

## Icon Reference

### Car Icons
- `sedan.svg` - Standard sedan (475 bytes)
- `suv.svg` - SUV/Estate (461 bytes)
- `taxi.svg` - Taxi cab (1.4 KB)
- `luxury.svg` - Luxury sedan (2.2 KB)
- `car_top_view.svg` - Top-down view (464 bytes)

### Landmark Icons
- `office_tower.svg` - Office building (277 bytes)
- `hotel.svg` - Hotel with marker (525 bytes)
- `mall.svg` - Shopping mall (189 bytes)
- `palm_tree.svg` - Palm tree (671 bytes)

## License

All icons are free for commercial use:
- Material Design Icons: Apache 2.0 License
- UXWing Icons: Free for commercial use without attribution

---

**Need Help?** Check the preview at `/icons/preview.html` to see all icons in action!
