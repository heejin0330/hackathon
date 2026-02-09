import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/utils/memory-store';
import { geminiService } from '@/lib/services/gemini.service';
import { getUserIdFromRequest } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user info
    const user = memoryStore.getUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create new session
    const session = memoryStore.createSession({
      userId,
      status: 'in_progress',
      language: user.language,
    });

    // Generate first greeting message from AI
    const firstMessageContent = await geminiService.generateGreeting(
      user.nickname,
      user.age,
      user.language
    );

    // Save first AI message
    memoryStore.addMessage({
      sessionId: session.sessionId,
      role: 'assistant',
      content: firstMessageContent,
      geminiMetadata: {},
    });

    return NextResponse.json({
      session_id: session.sessionId,
      first_message: {
        role: 'assistant',
        content: firstMessageContent,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


