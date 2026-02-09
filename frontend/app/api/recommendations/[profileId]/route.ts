import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { geminiService } from '@/lib/services/gemini.service';
import { getUserIdFromRequest } from '@/lib/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { profileId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get profile
    const profile = await prisma.userProfile.findFirst({
      where: {
        profileId: profileId,
        userId: userId,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
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
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

