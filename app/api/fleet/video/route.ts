import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VIDEO_CONFIG_PATH = path.join(process.cwd(), 'data', 'video-config.json');

// GET: Retrieve video URL
export async function GET() {
  try {
    if (fs.existsSync(VIDEO_CONFIG_PATH)) {
      const data = fs.readFileSync(VIDEO_CONFIG_PATH, 'utf-8');
      const config = JSON.parse(data);
      return NextResponse.json(config);
    }
    return NextResponse.json({ videoUrl: null });
  } catch (error) {
    console.error('Error reading video config:', error);
    return NextResponse.json({ videoUrl: null });
  }
}

// POST: Update video URL (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const body = await request.json();
    const { videoUrl } = body;

    const config = { videoUrl };

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(VIDEO_CONFIG_PATH, JSON.stringify(config, null, 2));

    return NextResponse.json({ success: true, videoUrl });
  } catch (error) {
    console.error('Error updating video config:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}
