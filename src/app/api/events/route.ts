import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { CampusEvent } from '@/lib/types';

// GET /api/events - List events with optional category and search filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM events WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR venue LIKE ? OR organizer LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY date ASC, time ASC';

    const events = db.all<CampusEvent>(query, params);

    return NextResponse.json({
      success: true,
      data: { events },
    });
  } catch (error: any) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event (Admin only)
export async function POST(req: NextRequest) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity = 100,
      banner_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      organizer = session?.name || 'Campus Event Committee',
      price = 0,
    } = body;

    // Validation
    if (!title || !description || !category || !date || !time || !venue) {
      return NextResponse.json(
        { success: false, error: 'Title, description, category, date, time, and venue are required' },
        { status: 400 }
      );
    }

    const parsedCapacity = parseInt(String(capacity), 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Capacity must be a positive number' },
        { status: 400 }
      );
    }

    const result = db.run(
      `INSERT INTO events (title, description, category, date, time, venue, capacity, registered_count, banner_url, organizer, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'Upcoming')`,
      [
        title.trim(),
        description.trim(),
        category.trim(),
        date,
        time,
        venue.trim(),
        parsedCapacity,
        banner_url.trim(),
        organizer.trim(),
        Number(price) || 0,
      ]
    );

    const createdEvent = db.get<CampusEvent>('SELECT * FROM events WHERE id = ?', [result.lastInsertRowid]);

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: { event: createdEvent },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
