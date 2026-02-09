import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { geminiService } from '../services/gemini.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router: Router = Router();

// POST /api/conversations/:sessionId/analyze - 대화 분석
router.post(
  '/conversations/:sessionId/analyze',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const sessionId = req.params.sessionId as string;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify session belongs to user
      const session = await prisma.conversationSession.findFirst({
        where: {
          sessionId,
          userId,
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Convert messages to Gemini format
      const geminiMessages = (session.messages || []).map((msg: any) => ({
        role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

      // Analyze conversation
      const analysis = await geminiService.analyzeConversation(
        geminiMessages,
        user.language
      );

      // Save user profile
      const profile = await prisma.userProfile.create({
        data: {
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
        },
      });

      // Update session status
      await prisma.conversationSession.update({
        where: { sessionId: sessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      res.json({
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
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// GET /api/recommendations/:profileId - 진로 추천 조회
router.get('/recommendations/:profileId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const profileId = req.params.profileId as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get profile
    const profile = await prisma.userProfile.findFirst({
      where: {
        profileId: profileId,
        userId: userId,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Check if recommendations already exist
    let recommendations = await prisma.careerRecommendation.findMany({
      where: { profileId: profileId },
      orderBy: { displayOrder: 'asc' },
    });

    // If no recommendations, generate them
    if (recommendations.length === 0) {
      const user = await prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate recommendations using Gemini
      const geminiRecommendations = await geminiService.generateCareerRecommendations(
        {
          interests: profile.interests,
          strengths: profile.strengths,
          values: profile.values,
          learning_style: profile.learningStyle,
          motivation_level: profile.motivationLevel,
          career_preferences: profile.careerPreferences,
        },
        user.language
      );

      // Save recommendations
      for (let i = 0; i < geminiRecommendations.length; i++) {
        const rec = geminiRecommendations[i];
        const saved = await prisma.careerRecommendation.create({
          data: {
            profileId: profileId,
            careerPathId: `path_${i + 1}`,
            careerName: rec.career_name,
            description: rec.description,
            matchReason: rec.match_reason,
            skillsNeeded: rec.skills_needed || [],
            exampleJobs: rec.example_jobs || [],
            educationPath: rec.education_path,
            growthPotential: rec.growth_potential,
            isCustom: false,
            displayOrder: i + 1,
          },
        });
        recommendations.push(saved);
      }
    }

    res.json({
      recommendations: recommendations.map((rec) => ({
        recommendation_id: rec.recommendationId,
        career_path_id: rec.careerPathId,
        career_name: rec.careerName,
        description: rec.description,
        match_reason: rec.matchReason,
        skills_needed: rec.skillsNeeded,
        example_jobs: rec.exampleJobs,
        education_path: rec.educationPath,
        growth_potential: rec.growthPotential,
        is_custom: rec.isCustom,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/recommendations/custom - 커스텀 진로 추가
router.post('/recommendations/custom', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { profile_id, custom_career_name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!profile_id || !custom_career_name) {
      return res.status(400).json({
        error: 'profile_id and custom_career_name are required',
      });
    }

    // Verify profile belongs to user
    const profile = await prisma.userProfile.findFirst({
      where: {
        profileId: profile_id,
        userId,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate custom career details using Gemini
    const customCareerPrompt = `User entered custom career path: "${custom_career_name}"

Please provide details similar to AI recommendations:
1. Validate if this is a realistic career path
2. Provide description (2-3 sentences, teenager-friendly)
3. Suggest why it might match the user's profile
4. List key skills needed
5. Suggest related jobs and qualifications
6. Provide education path
7. Growth potential

User profile:
${JSON.stringify({
  interests: profile.interests,
  strengths: profile.strengths,
  values: profile.values,
})}

Output JSON format:
{
  "career_name": "${custom_career_name}",
  "description": "...",
  "match_reason": "...",
  "skills_needed": ["..."],
  "example_jobs": ["..."],
  "education_path": "...",
  "growth_potential": "..."
}

Respond ONLY with valid JSON, no additional text.`;

    try {
      const model = (geminiService as any).genAI?.getGenerativeModel({
        model: 'gemini-3-flash-preview',
      });

      if (!model) {
        throw new Error('Gemini API not configured');
      }

      const result = await model.generateContent(customCareerPrompt);
      const response = await result.response;
      let jsonText = response.text().trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      const customCareer = JSON.parse(jsonText);

      // Get next display order
      const maxOrder = await prisma.careerRecommendation.findFirst({
        where: { profileId: profile_id as string },
        orderBy: { displayOrder: 'desc' },
      });

      const nextOrder = (maxOrder?.displayOrder || 0) + 1;

      // Save custom career
      const recommendation = await prisma.careerRecommendation.create({
        data: {
          profileId: profile_id as string,
          careerPathId: `custom_${Date.now()}`,
          careerName: customCareer.career_name,
          description: customCareer.description,
          matchReason: customCareer.match_reason,
          skillsNeeded: customCareer.skills_needed || [],
          exampleJobs: customCareer.example_jobs || [],
          educationPath: customCareer.education_path,
          growthPotential: customCareer.growth_potential,
          isCustom: true,
          displayOrder: nextOrder,
        },
      });

      res.json({
        recommendation_id: recommendation.recommendationId,
        career_path_id: recommendation.careerPathId,
        career_name: recommendation.careerName,
        description: recommendation.description,
        match_reason: recommendation.matchReason,
        skills_needed: recommendation.skillsNeeded,
        example_jobs: recommendation.exampleJobs,
        education_path: recommendation.educationPath,
        growth_potential: recommendation.growthPotential,
        is_custom: recommendation.isCustom,
      });
    } catch (error: any) {
      console.error('Error generating custom career:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  } catch (error: any) {
    console.error('Error creating custom career:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
