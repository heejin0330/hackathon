import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/utils/memory-store';
import { geminiService } from '@/lib/services/gemini.service';
import { getUserIdFromRequest } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const body = await request.json();
    const { profile_id, custom_career_name } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!profile_id || !custom_career_name) {
      return NextResponse.json(
        { error: 'profile_id and custom_career_name are required' },
        { status: 400 }
      );
    }

    // Verify profile belongs to user
    const profile = memoryStore.getProfile(profile_id);

    if (!profile || profile.userId !== userId) {
      return NextResponse.json(
        { error: 'Profile not found' },
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
      const existingRecs = memoryStore.getRecommendations(profile_id);
      const maxOrder = existingRecs.length > 0 
        ? Math.max(...existingRecs.map(r => r.displayOrder || 0))
        : 0;
      const nextOrder = maxOrder + 1;

      // Save custom career
      const recommendation = memoryStore.addRecommendation({
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
      });

      return NextResponse.json({
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
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating custom career:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


