import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'data', 'default-config.json');

// Verify password middleware
function verifyPassword(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const password = authHeader.substring(7);
  return password === adminPassword;
}

// POST: Reset to default configuration
export async function POST(request: NextRequest) {
  try {
    if (!verifyPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Copy default config to active config
    const defaultConfig = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf8');
    fs.writeFileSync(CONFIG_PATH, defaultConfig, 'utf8');
    
    const config = JSON.parse(defaultConfig);
    return NextResponse.json({ 
      success: true, 
      message: 'Configuration reset to defaults successfully',
      config 
    });
  } catch (error) {
    console.error('Error resetting config:', error);
    return NextResponse.json(
      { error: 'Failed to reset configuration' },
      { status: 500 }
    );
  }
}
