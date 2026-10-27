import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest, requireAdmin } from '@/lib/auth';
import { CampusEvent, Registration } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

// GET /api/events/:id - Get event details
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const eventId = parseInt(params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    const event = db.get<CampusEvent>('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Check if the requesting user is registered
    const session = await getSessionFromRequest(req);
    let userRegistration: Registration | null = null;

    if (session) {
      const reg = db.get<Registration>(
        'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
        [session.userId, eventId]
      );
      if (reg) {
        userRegistration = reg;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        event,
        isRegistered: !!userRegistration,
        registration: userRegistration,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/:id - Update event (Admin only)
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const eventId = parseInt(params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    const existingEvent = db.get<CampusEvent>('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!existingEvent) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title = existingEvent.title,
      description = existingEvent.description,
      category = existingEvent.category,
      date = existingEvent.date,
      time = existingEvent.time,
      venue = existingEvent.venue,
      capacity = existingEvent.capacity,
      banner_url = existingEvent.banner_url,
      organizer = existingEvent.organizer,
      price = existingEvent.price,
      status = existingEvent.status,
    } = body;

    db.run(
      `UPDATE events 
       SET title = ?, description = ?, category = ?, date = ?, time = ?, venue = ?, capacity = ?, banner_url = ?, organizer = ?, price = ?, status = ?
       WHERE id = ?`,
      [
        title,
        description,
        category,
        date,
        time,
        venue,
        Number(capacity),
        banner_url,
        organizer,
        Number(price),
        status,
        eventId,
      ]
    );

    const updatedEvent = db.get<CampusEvent>('SELECT * FROM events WHERE id = ?', [eventId]);

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id - Delete event (Admin only)
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const eventId = parseInt(params.id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    const existingEvent = db.get<CampusEvent>('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!existingEvent) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Delete event (foreign key cascade deletes registrations)
    db.run('DELETE FROM events WHERE id = ?', [eventId]);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
