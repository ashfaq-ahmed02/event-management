import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthSession } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'campusevent-super-secret-jwt-key-2026';
const TOKEN_EXPIRY = '7d';

export function signToken(payload: AuthSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req?: Request): Promise<AuthSession | null> {
  let token: string | undefined;

  // 1. Try Authorization header
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  // 2. Try cookie
  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get('token')?.value;
    } catch {
      // In non-request context or when cookies() is unavailable
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(req: Request): Promise<{ session: AuthSession | null; errorResponse?: Response }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return {
      session: null,
      errorResponse: Response.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }
  return { session };
}

export async function requireAdmin(req: Request): Promise<{ session: AuthSession | null; errorResponse?: Response }> {
  const { session, errorResponse } = await requireAuth(req);
  if (errorResponse) return { session: null, errorResponse };

  if (session?.role !== 'admin') {
    return {
      session: null,
      errorResponse: Response.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { session };
}
