import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { geminiService } from '@/lib/services/gemini.service';
import { getUserIdFromRequest } from '@/lib/utils/auth';

function buildVisionBoardPrompt(
  style: string,
  careerName: string,
  exampleJob: string,
  language: string
): string {
  const stylePrompts: Record<string, string> = {
    id_badge: `Create a professional employee ID badge in the style of a modern tech company.

Style: Clean, modern, professional
Layout: Standard ID badge format (portrait orientation)
Elements to include:
- A professional-looking person in professional attire
- Company name related to: ${careerName}
- Job title: ${exampleJob}
- Futuristic year: 2040
- Professional design with company logo
- Barcode or QR code for authenticity
- Clean typography, corporate colors

The person should look confident, professional, and happy.
Positive, aspirational, encouraging mood.
High quality, photorealistic rendering.`,

    magazine_cover: `Create a professional magazine cover featuring a successful young professional.

Magazine theme: ${careerName} industry publication
Person's role: Rising star in ${exampleJob}
Year: 2040

Cover elements:
- A confident young professional in a professional setting appropriate for the career
- Magazine masthead (e.g., "Future Innovators", "Change Makers")
- Main headline: "The Future of ${careerName}"
- Subheadline highlighting their achievement
- Clean, modern magazine layout
- Professional photography style
- Positive, aspirational mood

The person should look accomplished, confident, and inspiring.
Setting should reflect their career field.
High quality, editorial photography style.`,

    achievement: `Create an inspirational scene of professional achievement.

Scene: Award ceremony or recognition event
Person's achievement: Excellence in ${careerName}
Setting: Professional conference or gala event
Year: 2040

Scene elements:
- A young professional receiving award or recognition
- Confident, proud posture
- Professional formal attire
- Award trophy or certificate visible
- Audience or colleagues applauding in background
- Stage with professional lighting
- Inspirational, celebratory atmosphere

The person should look proud, accomplished, and grateful.
Positive, uplifting mood that inspires teenagers.
Photorealistic, high-quality rendering.`,
  };

  return stylePrompts[style] || stylePrompts.magazine_cover;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const body = await request.json();
    const { recommendation_id, style = 'magazine_cover' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!recommendation_id) {
      return NextResponse.json(
        { error: 'recommendation_id is required' },
        { status: 400 }
      );
    }

    const validStyles = ['id_badge', 'magazine_cover', 'achievement'];
    if (!validStyles.includes(style)) {
      return NextResponse.json(
        { error: 'Invalid style. Use: id_badge, magazine_cover, achievement' },
        { status: 400 }
      );
    }

    const recommendation = await prisma.careerRecommendation.findUnique({
      where: { recommendationId: recommendation_id },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    if (recommendation.profile.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const user = recommendation.profile.user;
    const careerName = recommendation.careerName;
    const exampleJob = recommendation.exampleJobs[0] || careerName;

    const prompt = buildVisionBoardPrompt(style, careerName, exampleJob, user.language);

    const genAI = (geminiService as any).genAI;
    if (!genAI) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

      const visionPrompt = `You are creating a vision board for a teenager who wants to pursue a career in "${careerName}".

The style is: ${style === 'id_badge' ? 'Employee ID Badge' : style === 'magazine_cover' ? 'Magazine Cover' : 'Achievement Scene'}

Create an inspiring, detailed vision board description in ${user.language === 'ko' ? 'Korean' : user.language === 'en' ? 'English' : user.language === 'es' ? 'Spanish' : 'Japanese'}.

Include:
1. A vivid description of what the person looks like in this role (2040)
2. Their achievements and accomplishments
3. A motivational quote or message
4. Key milestones on their path to success
5. What their typical work day looks like

User profile:
- Interests: ${recommendation.profile.interests.join(', ')}
- Strengths: ${recommendation.profile.strengths.join(', ')}
- Values: ${recommendation.profile.values.join(', ')}

Respond in JSON format:
{
  "title": "Vision board title",
  "year": "2040",
  "role": "${exampleJob}",
  "company": "A fictional inspiring company name",
  "description": "Vivid description of future success",
  "achievements": ["achievement 1", "achievement 2", "achievement 3"],
  "quote": "An inspirational quote",
  "milestones": [
    {"year": "2028", "event": "milestone description"},
    {"year": "2032", "event": "milestone description"},
    {"year": "2040", "event": "milestone description"}
  ],
  "daily_life": "Description of a typical work day"
}

Respond ONLY with valid JSON.`;

      const result = await model.generateContent(visionPrompt);
      const response = await result.response;
      let jsonText = response.text().trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      const visionData = JSON.parse(jsonText);

      const visionImage = await prisma.visionBoardImage.create({
        data: {
          userId,
          recommendationId: recommendation_id,
          style,
          imageUrl: JSON.stringify(visionData),
          geminiPrompt: prompt,
          safetyCheckPassed: true,
        },
      });

      return NextResponse.json({
        image_id: visionImage.imageId,
        style,
        career_name: careerName,
        vision_data: visionData,
        generated_at: visionImage.generatedAt,
      });
    } catch (genError: any) {
      console.error('Error generating vision board content:', genError);
      return NextResponse.json(
        { error: `Generation failed: ${genError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in vision board generation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

