import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Registration } from '@/lib/types';

interface RouteContext {
  params: { id: string };
}

// GET /api/registrations/event/:id - Get attendee list for specific event (Admin only)
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const eventId = parseInt(params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    const event = db.get('SELECT title, capacity, registered_count FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const attendees = db.all<Registration>(
      `SELECT r.id, r.user_id, r.event_id, r.ticket_code, r.status, r.registered_at,
              u.name as user_name, u.email as user_email, u.department as user_department
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ?
       ORDER BY r.registered_at DESC`,
      [eventId]
    );

    return NextResponse.json({
      success: true,
      data: {
        event,
        attendees,
        total: attendees.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch attendees' },
      { status: 500 }
    );
  }
}
