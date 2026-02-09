import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { getUserIdFromRequest } from '@/lib/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { imageId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: 'Vision board not found' },
        { status: 404 }
      );
    }

    let visionData;
    try {
      visionData = JSON.parse(visionImage.imageUrl);
    } catch {
      visionData = { description: visionImage.imageUrl };
    }

    return NextResponse.json({
      image_id: visionImage.imageId,
      style: visionImage.style,
      career_name: visionImage.recommendation?.careerName || '',
      vision_data: visionData,
      generated_at: visionImage.generatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching vision board:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

