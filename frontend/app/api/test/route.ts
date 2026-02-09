import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Try to connect to database
    let dbConnected = false;
    let dbError = null;
    try {
      await prisma.$connect();
      dbConnected = true;
      await prisma.$disconnect();
    } catch (error: any) {
      dbError = error.message;
    }

    return NextResponse.json({
      status: 'ok',
      environment: envCheck,
      database: {
        connected: dbConnected,
        error: dbError,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

