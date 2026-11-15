import { NextRequest, NextResponse } from 'next/server';
import { getBatchDetails } from '@/lib/airtable';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing batch id.' }, { status: 400 });
    }

    const details = await getBatchDetails(id);
    return NextResponse.json({ success: true, data: details });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching batch details:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
