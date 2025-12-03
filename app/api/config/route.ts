import { NextResponse } from 'next/server';
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

// GET: Load current configuration (public endpoint for calculator)
export async function GET() {
  try {
    ensureConfigExists();
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading config:', error);
    // Fallback to default config
    try {
      const defaultConfig = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf8');
      return NextResponse.json(JSON.parse(defaultConfig));
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to load configuration' },
        { status: 500 }
      );
    }
  }
}
