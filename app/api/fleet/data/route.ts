import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  FleetData,
  calculate2HourUpdates,
  checkDailyReset,
  checkMonthlyReset,
  rotateMaintenanceCars,
  needs2HourUpdate,
} from '@/lib/fleet-calculations';

const DATA_FILE = path.join(process.cwd(), 'data', 'fleet-data.json');

/**
 * GET endpoint - Returns fleet data with automatic updates
 * Applies 2-hour/daily/monthly/maintenance logic automatically
 */
export async function GET() {
  try {
    // Read current data
    let data: FleetData;
    
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    } else {
      // Return error if no data exists
      return NextResponse.json(
        { error: 'Fleet data not initialized' },
        { status: 404 }
      );
    }
    
    let updated = false;
    
    // 1. Check for daily reset (midnight - resets tripsToday, revenueToday)
    const afterDailyReset = checkDailyReset(data);
    if (afterDailyReset !== data) {
      data = afterDailyReset;
      updated = true;
      console.log('Daily reset performed');
    }
    
    // 2. Check for monthly reset (day 7)
    const afterMonthlyReset = checkMonthlyReset(data);
    if (afterMonthlyReset !== data) {
      data = afterMonthlyReset;
      updated = true;
      console.log('Monthly reset performed');
    }
    
    // 3. Check for maintenance rotation (every 2-3 days)
    const afterMaintenance = rotateMaintenanceCars(data);
    if (afterMaintenance !== data) {
      data = afterMaintenance;
      updated = true;
      console.log('Maintenance rotation performed');
    }
    
    // 4. Check for 2-hour update (trips, passengers, revenue)
    if (needs2HourUpdate(data.last2HourUpdate)) {
      data = calculate2HourUpdates(data);
      updated = true;
      console.log('2-hour update performed');
    }
    
    // 5. Save updated data if any changes occurred
    if (updated) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('Fleet data updated and saved');
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to read/update fleet data:', error);
    return NextResponse.json(
      { error: 'Failed to process fleet data' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint - Manual update (admin only)
 * Used by admin panel to manually modify fleet data
 */
export async function POST(request: Request) {
  try {
    // TODO: Add admin authentication here if needed
    
    const data = await request.json();
    
    // Add timestamp
    data.lastUpdated = new Date().toISOString();
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save data
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to save fleet data:', error);
    return NextResponse.json(
      { error: 'Failed to save fleet data' },
      { status: 500 }
    );
  }
}
