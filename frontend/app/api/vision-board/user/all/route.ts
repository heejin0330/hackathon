import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
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

    const visionImages = await prisma.visionBoardImage.findMany({
      where: { userId },
      include: {
        recommendation: true,
      },
      orderBy: { generatedAt: 'desc' },
    });

    return NextResponse.json({
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

