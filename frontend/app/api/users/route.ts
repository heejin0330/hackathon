import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { generateToken } from '@/lib/utils/jwt';
import { geminiService } from '@/lib/services/gemini.service';

export async function POST(request: NextRequest) {
  try {
    console.log('=== /api/users POST ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    const body = await request.json();
    console.log('Request body:', body);
    const { nickname, age, language, country, preferredInputMethod, grade } = body;

    // Validation
    if (!nickname || !age || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: nickname, age, language' },
        { status: 400 }
      );
    }

    // Age validation (10-17)
    if (age < 10 || age > 17) {
      return NextResponse.json(
        { error: 'Age must be between 10 and 17' },
        { status: 400 }
      );
    }

    // Language validation
    const validLanguages = ['ko', 'en', 'es', 'ja'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: `Language must be one of: ${validLanguages.join(', ')}` },
        { status: 400 }
      );
    }

    // Nickname validation (using Gemini API)
    console.log('Validating nickname...');
    let isNicknameValid = true;
    try {
      isNicknameValid = await geminiService.validateNickname(nickname);
      console.log('Nickname validation result:', isNicknameValid);
    } catch (geminiError: any) {
      console.error('Gemini validation error (continuing with basic validation):', geminiError);
      // Fallback to basic validation if Gemini fails
      isNicknameValid = nickname.length >= 2 && nickname.length <= 50;
    }

    if (!isNicknameValid) {
      return NextResponse.json(
        { error: 'Nickname contains inappropriate language' },
        { status: 400 }
      );
    }

    // Create user
    console.log('Creating user in database...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET');
    
    let user;
    try {
      user = await prisma.user.create({
        data: {
          nickname,
          age,
          language,
          country: country || null,
          preferredInputMethod: preferredInputMethod || null,
          lastActive: new Date(),
        },
      });
      console.log('User created:', user.userId);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error meta:', dbError.meta);
      throw new Error(`Database error: ${dbError.message || 'Unknown database error'}`);
    }

    // Generate JWT token
    console.log('Generating JWT token...');
    const token = generateToken(user.userId);
    console.log('Token generated successfully');

    return NextResponse.json(
      {
        user_id: user.userId,
        session_token: token,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('=== ERROR in /api/users ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? {
          type: error?.constructor?.name,
          message: error?.message,
          stack: error?.stack,
        } : undefined
      },
      { status: 500 }
    );
  }
}

