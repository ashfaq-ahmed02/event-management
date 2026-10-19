import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { CampusEvent, Registration } from '@/lib/types';

interface RouteContext {
  params: { id: string };
}

// POST /api/events/:id/register - Register current user for event
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { session, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const eventId = parseInt(params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    // 1. Check if event exists
    const event = db.get<CampusEvent>('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    if (event.status === 'Completed' || event.status === 'Cancelled') {
      return NextResponse.json(
        { success: false, error: `Cannot register for a ${event.status.toLowerCase()} event` },
        { status: 400 }
      );
    }

    // 2. Check if already registered
    const existing = db.get<Registration>(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
      [session!.userId, eventId]
    );

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this event', registration: existing },
        { status: 409 }
      );
    }

    // 3. Check capacity
    if (event.registered_count >= event.capacity) {
      return NextResponse.json(
        { success: false, error: 'Event is fully booked. No seats remaining.' },
        { status: 400 }
      );
    }

    // 4. Generate unique Ticket Code
    const prefix = event.category.substring(0, 3).toUpperCase();
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const ticketCode = `CE-${prefix}-${randomCode}`;

    // 5. Atomic registration & counter increment
    db.run(
      `INSERT INTO registrations (user_id, event_id, ticket_code, status) VALUES (?, ?, ?, ?)`,
      [session!.userId, eventId, ticketCode, 'confirmed']
    );

    db.run(
      `UPDATE events SET registered_count = registered_count + 1 WHERE id = ?`,
      [eventId]
    );

    const createdReg = db.get<Registration>(
      `SELECT r.*, e.title as event_title, e.date as event_date, e.time as event_time, e.venue as event_venue, e.category as event_category
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ? AND r.event_id = ?`,
      [session!.userId, eventId]
    );

    return NextResponse.json({
      success: true,
      message: 'Registration confirmed! Your digital ticket is ready.',
      data: { registration: createdReg },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to complete registration' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id/register - Cancel registration
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { session, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const eventId = parseInt(params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    const reg = db.get<Registration>(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
      [session!.userId, eventId]
    );

    if (!reg) {
      return NextResponse.json(
        { success: false, error: 'You do not have an active registration for this event' },
        { status: 404 }
      );
    }

    db.run('DELETE FROM registrations WHERE id = ?', [reg.id]);
    db.run('UPDATE events SET registered_count = MAX(0, registered_count - 1) WHERE id = ?', [eventId]);

    return NextResponse.json({
      success: true,
      message: 'Event registration successfully cancelled. Seat has been released.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}
