import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { geminiService } from '@/lib/services/gemini.service';
import { getUserIdFromRequest } from '@/lib/utils/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { sessionId } = await params;
    const body = await request.json();
    const { content, input_method } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const session = await prisma.conversationSession.findFirst({
      where: {
        sessionId,
        userId,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Save user message
    await prisma.conversationMessage.create({
      data: {
        sessionId,
        role: 'user',
        content,
        inputMethod: input_method || 'text',
      },
    });

    // Get conversation history
    const messages = await prisma.conversationMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });

    // Convert to Gemini format
    const geminiMessages = messages.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }));

    // Generate system prompt
    const systemPrompt = geminiService.getSystemPrompt(user.language, user.age);

    // Get AI response
    const aiResponse = await geminiService.sendMessage(
      geminiMessages,
      systemPrompt,
      user.language
    );

    // Save AI message
    await prisma.conversationMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: aiResponse.content,
        geminiMetadata: aiResponse.metadata || {},
      },
    });

    // Calculate progress (rough estimate based on message count)
    const messageCount = messages.length + 2; // +2 for the new messages
    const estimatedProgress = Math.min(messageCount / 20, 1.0); // ~20 messages for full conversation

    return NextResponse.json({
      message_id: 'generated',
      ai_response: {
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
      },
      progress: estimatedProgress,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

