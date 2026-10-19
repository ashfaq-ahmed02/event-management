import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { AuthSession, UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = 'student', department = 'General' } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ['student', 'admin'];
    const assignedRole: UserRole = validRoles.includes(role) ? role : 'student';

    // Check if user already exists
    const existing = db.get<{ id: number }>('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert user
    const result = db.run(
      `INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), trimmedEmail, passwordHash, assignedRole, department.trim()]
    );

    const userSession: AuthSession = {
      userId: result.lastInsertRowid,
      name: name.trim(),
      email: trimmedEmail,
      role: assignedRole,
      department: department.trim(),
    };

    const token = signToken(userSession);

    const res = NextResponse.json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user: userSession,
        token,
      },
    }, { status: 201 });

    // Set cookie
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
