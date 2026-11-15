import { NextRequest, NextResponse } from 'next/server';
import { completeTask } from '@/lib/airtable';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing task id.' }, { status: 400 });
    }

    const result = await completeTask(id);

    if (!result.success) {
      // Return 400 Bad Request if invariant violated (e.g. Task State is LOCKED)
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to complete task.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task marked as done successfully.',
      task: result.task,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error completing task:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
