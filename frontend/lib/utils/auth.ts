import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export interface AuthRequest extends NextRequest {
  userId?: string;
}

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

