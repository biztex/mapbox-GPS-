# Dubai Fleet Tracking Dashboard - SVG Icons

This directory contains professional SVG icons for the Dubai fleet tracking map application.

## Car Icons (5 types)

1. **sedan.svg** - Sedan car side view
   - Source: Material Design Icons (mdi/car-side)
   - Style: Clean, professional outline
   - Perfect for: Standard passenger vehicles

2. **suv.svg** - SUV/Estate car side view
   - Source: Material Design Icons (mdi/car-estate)
   - Style: Clean, professional outline
   - Perfect for: Larger vehicles, family cars

3. **taxi.svg** - Taxi cab side view
   - Source: UXWing (taxi-cab-icon)
   - Style: Detailed, recognizable taxi design
   - Perfect for: Taxi/ride-hailing vehicles

4. **luxury.svg** - Luxury sedan side view
   - Source: UXWing (sedan-car-icon)
   - Style: Detailed, premium car design
   - Perfect for: Premium/luxury fleet vehicles

5. **car_top_view.svg** - Car top-down view
   - Source: Material Design Icons (mdi/car)
   - Style: Top-down perspective for map overlay
   - Perfect for: Map tracking display

## Building/Landmark Icons (4 types)

1. **office_tower.svg** - Office building/skyscraper
   - Source: Material Design Icons (mdi/office-building)
   - Style: Flat, modern office tower
   - Perfect for: Business districts, corporate locations

2. **hotel.svg** - Hotel building with marker
   - Source: Material Design Icons (mdi/office-building-marker)
   - Style: Building with location marker
   - Perfect for: Hotels, accommodation landmarks

3. **mall.svg** - Shopping mall/store
   - Source: Material Design Icons (mdi/store)
   - Style: Simple storefront design
   - Perfect for: Shopping centers, retail locations

4. **palm_tree.svg** - Palm tree (Dubai style)
   - Source: Material Design Icons (mdi/palm-tree)
   - Style: Tropical palm tree silhouette
   - Perfect for: Dubai aesthetic, beach areas, parks

## Technical Details

- **Format**: SVG (Scalable Vector Graphics)
- **Size**: Optimized for 40-50px display
- **Color**: All icons use `currentColor` for easy theming
- **License**: Free for commercial use (Material Design Icons - Apache 2.0, UXWing - Free for commercial use)
- **Compatibility**: Works with all modern browsers

## Usage in React/Next.js

```jsx
import Image from 'next/image';

// Example usage
<Image 
  src="/icons/sedan.svg" 
  alt="Sedan" 
  width={40} 
  height={40}
  className="text-blue-500"
/>
```

## Styling with Tailwind CSS

Since icons use `currentColor`, you can easily change their color:

```jsx
<img 
  src="/icons/car_top_view.svg" 
  className="w-10 h-10 text-red-500"
  alt="Car"
/>
```

## Map Integration

These icons are optimized for overlay on map applications:
- Top-down car view for realistic map tracking
- Building icons for landmark identification
- Consistent style for professional appearance
- Small file sizes for fast loading

---

**Last Updated**: November 27, 2025
**Project**: Dubai Fleet Tracking Dashboard
