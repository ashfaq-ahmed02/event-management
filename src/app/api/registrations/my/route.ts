import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Registration } from '@/lib/types';

// GET /api/registrations/my - Get current user's registered events
export async function GET(req: NextRequest) {
  try {
    const { session, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const registrations = db.all<Registration>(
      `SELECT r.id, r.user_id, r.event_id, r.ticket_code, r.status, r.registered_at,
              e.title as event_title, e.category as event_category, e.date as event_date,
              e.time as event_time, e.venue as event_venue, e.banner_url, e.organizer
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ?
       ORDER BY e.date ASC, e.time ASC`,
      [session!.userId]
    );

    return NextResponse.json({
      success: true,
      data: { registrations },
    });
  } catch (error: any) {
    console.error('Fetch registrations error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
