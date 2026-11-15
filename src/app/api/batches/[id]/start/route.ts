import { NextRequest, NextResponse } from 'next/server';
import { startBatch } from '@/lib/airtable';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing batch id.' }, { status: 400 });
    }

    const result = await startBatch(id);

    if (!result.success) {
      // Return 400 Bad Request if invariant violated
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to start batch.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Batch started successfully.',
      startedAt: result.startedAt,
      batch: result.batch,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error starting batch:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
