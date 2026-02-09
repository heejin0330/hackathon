import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/utils/memory-store';
import { getUserIdFromRequest } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const visionImages = memoryStore.getVisionBoards(userId).sort((a, b) => 
      b.generatedAt.getTime() - a.generatedAt.getTime()
    );

    return NextResponse.json({
      vision_boards: visionImages.map((img) => {
        // Get career name from recommendation if available
        let careerName = '';
        if (img.recommendationId) {
          const recData = memoryStore.getRecommendationById(img.recommendationId);
          if (recData) {
            careerName = recData.recommendation.careerName;
          }
        }

        let visionData;
        try {
          visionData = JSON.parse(img.imageUrl);
        } catch {
          visionData = { description: img.imageUrl };
        }

        return {
          image_id: img.imageId,
          style: img.style,
          career_name: careerName,
          vision_data: visionData,
          generated_at: img.generatedAt,
        };
      }),
    });
  } catch (error: any) {
    console.error('Error fetching vision boards:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

