import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { geminiService } from '../services/gemini.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router: Router = Router();

// Imagen 3를 통한 비전보드 이미지 생성 프롬프트 빌더
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

// POST /api/vision-board/generate - 비전 보드 이미지 생성
router.post(
  '/generate',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { recommendation_id, style = 'magazine_cover' } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!recommendation_id) {
        return res.status(400).json({ error: 'recommendation_id is required' });
      }

      // 유효한 스타일인지 확인
      const validStyles = ['id_badge', 'magazine_cover', 'achievement'];
      if (!validStyles.includes(style)) {
        return res.status(400).json({ error: 'Invalid style. Use: id_badge, magazine_cover, achievement' });
      }

      // 추천 정보 가져오기
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
        return res.status(404).json({ error: 'Recommendation not found' });
      }

      // 유저 확인
      if (recommendation.profile.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const user = recommendation.profile.user;
      const careerName = recommendation.careerName;
      const exampleJob = recommendation.exampleJobs[0] || careerName;

      // 이미지 생성 프롬프트 구성
      const prompt = buildVisionBoardPrompt(style, careerName, exampleJob, user.language);

      // Gemini를 통해 비전보드 설명 텍스트 생성
      const genAI = (geminiService as any).genAI;
      if (!genAI) {
        return res.status(500).json({ error: 'AI service not configured' });
      }

      // Imagen 3 API 호출 (Gemini API를 통한 이미지 생성)
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        // 비전보드 텍스트 콘텐츠 생성 (이미지 대신 상세 설명 + 영감 메시지)
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

        // 비전보드 이미지 레코드 저장 (이미지 URL 대신 비전 데이터)
        const visionImage = await prisma.visionBoardImage.create({
          data: {
            userId,
            recommendationId: recommendation_id,
            style,
            imageUrl: JSON.stringify(visionData), // 비전 데이터를 JSON으로 저장
            geminiPrompt: prompt,
            safetyCheckPassed: true,
          },
        });

        res.json({
          image_id: visionImage.imageId,
          style,
          career_name: careerName,
          vision_data: visionData,
          generated_at: visionImage.generatedAt,
        });
      } catch (genError: any) {
        console.error('Error generating vision board content:', genError);
        res.status(500).json({ error: `Generation failed: ${genError.message}` });
      }
    } catch (error: any) {
      console.error('Error in vision board generation:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// GET /api/vision-board/:imageId - 비전 보드 조회
router.get(
  '/:imageId',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const imageId = req.params.imageId as string;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const visionImage = await prisma.visionBoardImage.findFirst({
        where: {
          imageId,
          userId,
        },
        include: {
          recommendation: true,
        },
      });

      if (!visionImage) {
        return res.status(404).json({ error: 'Vision board not found' });
      }

      let visionData;
      try {
        visionData = JSON.parse(visionImage.imageUrl);
      } catch {
        visionData = { description: visionImage.imageUrl };
      }

      res.json({
        image_id: visionImage.imageId,
        style: visionImage.style,
        career_name: visionImage.recommendation?.careerName || '',
        vision_data: visionData,
        generated_at: visionImage.generatedAt,
      });
    } catch (error: any) {
      console.error('Error fetching vision board:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// GET /api/vision-board/user/all - 사용자의 모든 비전 보드
router.get(
  '/user/all',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const visionImages = await prisma.visionBoardImage.findMany({
        where: { userId },
        include: {
          recommendation: true,
        },
        orderBy: { generatedAt: 'desc' },
      });

      res.json({
        vision_boards: visionImages.map((img) => {
          let visionData;
          try {
            visionData = JSON.parse(img.imageUrl);
          } catch {
            visionData = { description: img.imageUrl };
          }

          return {
            image_id: img.imageId,
            style: img.style,
            career_name: img.recommendation?.careerName || '',
            vision_data: visionData,
            generated_at: img.generatedAt,
          };
        }),
      });
    } catch (error: any) {
      console.error('Error fetching vision boards:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

export default router;

