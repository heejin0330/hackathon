import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/utils/memory-store';
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
    const session = memoryStore.getSession(sessionId);

    if (!session || session.userId !== userId) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
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

    // Save user message
    memoryStore.addMessage({
      sessionId,
      role: 'user',
      content,
      inputMethod: input_method || 'text',
    });

    // Get conversation history
    const messages = memoryStore.getMessages(sessionId).sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

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
    memoryStore.addMessage({
      sessionId,
      role: 'assistant',
      content: aiResponse.content,
      geminiMetadata: aiResponse.metadata || {},
    });

    // Calculate progress (AI 메시지 저장 후 다시 카운트)
    const allMessages = memoryStore.getMessages(sessionId);
    const messageCount = allMessages.length;
    
    // 제곱근을 사용하면 초반에는 빠르게, 후반에는 천천히 증가
    // 최소 40개 메시지 이상 대화해야 완료 (최대 95%까지만)
    // 초기 인사 메시지 1개 + 사용자/AI 메시지 쌍 = 2개씩 증가
    // 20번 대화 = 40개 메시지 = 약 95% 진행도
    const estimatedProgress = Math.min(Math.sqrt(messageCount / 40), 0.95);

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

