import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'data', 'default-config.json');

// Helper to ensure config file exists
function ensureConfigExists() {
  if (!fs.existsSync(CONFIG_PATH)) {
    const defaultConfig = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf8');
    fs.writeFileSync(CONFIG_PATH, defaultConfig, 'utf8');
  }
}

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

// GET: Load current configuration
export async function GET(request: NextRequest) {
  try {
    if (!verifyPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    ensureConfigExists();
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading config:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}

// POST: Save configuration
export async function POST(request: NextRequest) {
  try {
    if (!verifyPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const config = await request.json();
    
    // Validate configuration structure
    if (!config.tiers || !Array.isArray(config.tiers) || config.tiers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid configuration: tiers array is required' },
        { status: 400 }
      );
    }

    // Save configuration
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
