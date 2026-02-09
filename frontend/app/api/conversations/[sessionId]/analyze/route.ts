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

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Get messages
    const messages = memoryStore.getMessages(sessionId).sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }));

    // Analyze conversation
    const analysis = await geminiService.analyzeConversation(
      geminiMessages,
      user.language
    );

    // Save user profile
    const profile = memoryStore.createProfile({
      userId,
      sessionId: sessionId || null,
      interests: analysis.interests || [],
      strengths: analysis.strengths || [],
      values: analysis.values || [],
      learningStyle: analysis.learning_style || null,
      motivationLevel: analysis.motivation_level || null,
      careerPreferences: analysis.career_preferences || null,
      mentalHealthFlags: analysis.mental_health_flags || [],
      geminiAnalysisRaw: analysis,
    });

    // Update session status
    memoryStore.updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date(),
    });

    return NextResponse.json({
      profile_id: profile.profileId,
      analysis: {
        interests: profile.interests,
        strengths: profile.strengths,
        values: profile.values,
        learning_style: profile.learningStyle,
        motivation_level: profile.motivationLevel,
        career_preferences: profile.careerPreferences,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

