import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { geminiService } from '../services/gemini.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router: Router = Router();

interface CreateUserRequest {
  nickname: string;
  age: number;
  language: string;
  country?: string;
  preferredInputMethod?: 'text' | 'voice' | 'mixed';
  grade?: string;
}

// POST /api/users - 사용자 생성
router.post('/', async (req: Request<{}, {}, CreateUserRequest>, res: Response) => {
  try {
    const { nickname, age, language, country, preferredInputMethod, grade } = req.body;

    // Validation
    if (!nickname || !age || !language) {
      return res.status(400).json({
        error: 'Missing required fields: nickname, age, language',
      });
    }

    // Age validation (10-17)
    if (age < 10 || age > 17) {
      return res.status(400).json({
        error: 'Age must be between 10 and 17',
      });
    }

    // Language validation
    const validLanguages = ['ko', 'en', 'es', 'ja'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        error: `Language must be one of: ${validLanguages.join(', ')}`,
      });
    }

    // Nickname validation (using Gemini API)
    const isNicknameValid = await geminiService.validateNickname(nickname);
    if (!isNicknameValid) {
      return res.status(400).json({
        error: 'Nickname contains inappropriate language',
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        nickname,
        age,
        language,
        country: country || null,
        preferredInputMethod: preferredInputMethod || null,
        lastActive: new Date(),
      },
    });

    // Generate JWT token
    const token = generateToken(user.userId);

    res.status(201).json({
      user_id: user.userId,
      session_token: token,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// GET /api/users/me - 현재 사용자 정보 조회
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        nickname: true,
        age: true,
        language: true,
        country: true,
        preferredInputMethod: true,
        createdAt: true,
        lastActive: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

