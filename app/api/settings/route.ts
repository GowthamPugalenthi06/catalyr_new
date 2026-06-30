import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const IS_PROD = process.env.NODE_ENV === "production" || process.env.VERCEL;
const BUNDLED_SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');
const DATA_DIR = IS_PROD ? "/tmp/data" : path.join(process.cwd(), 'data');
const settingsFilePath = path.join(DATA_DIR, 'settings.json');

function ensureSettingsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(settingsFilePath)) {
    try {
      const bundledData = fs.readFileSync(BUNDLED_SETTINGS_FILE, 'utf8');
      fs.writeFileSync(settingsFilePath, bundledData, 'utf8');
    } catch {
      fs.writeFileSync(settingsFilePath, "{}", 'utf8');
    }
  }
}

export async function GET() {
  try {
    ensureSettingsFile();
    const data = fs.readFileSync(settingsFilePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Failed to read settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureSettingsFile();
    const data = await req.json();
    fs.writeFileSync(settingsFilePath, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
