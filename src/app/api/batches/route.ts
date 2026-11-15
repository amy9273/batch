import { NextRequest, NextResponse } from 'next/server';
import { getBatchesForWorker } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const worker = searchParams.get('worker') || process.env.DEFAULT_WORKER || 'Ana';
    const date = searchParams.get('date') || process.env.DEFAULT_BUSINESS_DATE || '2026-10-22';

    const batches = await getBatchesForWorker(worker, date);
    return NextResponse.json({ success: true, data: batches });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching batches:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
