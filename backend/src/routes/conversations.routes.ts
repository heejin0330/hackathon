import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { geminiService } from '../services/gemini.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router: Router = Router();

// POST /api/conversations/start - 대화 세션 시작
router.post('/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new session
    const session = await prisma.conversationSession.create({
      data: {
        userId,
        status: 'in_progress',
        language: user.language,
      },
    });

    // Generate first greeting message from AI
    const firstMessageContent = await geminiService.generateGreeting(
      user.nickname,
      user.age,
      user.language
    );

    // Save first AI message
    await prisma.conversationMessage.create({
      data: {
        sessionId: session.sessionId,
        role: 'assistant',
        content: firstMessageContent,
        geminiMetadata: {},
      },
    });

    res.json({
      session_id: session.sessionId,
      first_message: {
        role: 'assistant',
        content: firstMessageContent,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/conversations/:sessionId/messages - 메시지 전송
router.post(
  '/:sessionId/messages',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      // 수정: params에서 가져온 sessionId를 string으로 단언
      const sessionId = req.params.sessionId as string; 
      const { content, input_method } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      // Verify session belongs to user
      const session = await prisma.conversationSession.findFirst({
        where: {
          sessionId,
          userId: userId!,
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { userId: userId! },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Save user message
      await prisma.conversationMessage.create({
        data: {
          sessionId, // 이제 확실한 string 타입입니다.
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

      res.json({
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
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// GET /api/conversations/:sessionId - 세션 및 메시지 조회
router.get('/:sessionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    // 수정: params에서 가져온 sessionId를 string으로 단언
    const sessionId = req.params.sessionId as string; 

    const session = await prisma.conversationSession.findFirst({
      where: {
        sessionId,
        userId: userId!,
      },
      // messages를 include해야 아래 session.messages.map이 작동합니다.
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      session_id: session.sessionId,
      status: session.status,
      started_at: session.startedAt,
      completed_at: session.completedAt,
      // session.messages가 이제 존재하므로 에러가 사라집니다.
      messages: session.messages.map((msg) => ({
        message_id: msg.messageId,
        role: msg.role,
        content: msg.content,
        input_method: msg.inputMethod,
        timestamp: msg.timestamp,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;