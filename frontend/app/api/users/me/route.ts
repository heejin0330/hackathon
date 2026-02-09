import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/utils/memory-store';
import { getUserIdFromRequest } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = memoryStore.getUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: user.userId,
      nickname: user.nickname,
      age: user.age,
      language: user.language,
      country: user.country,
      preferredInputMethod: user.preferredInputMethod,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


