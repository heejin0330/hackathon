import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRoutes from './routes/users.routes';
import conversationsRoutes from './routes/conversations.routes';
import recommendationsRoutes from './routes/recommendations.routes';
import visionboardRoutes from './routes/visionboard.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정: 여러 origin 허용
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3002'];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // origin이 없는 경우 (같은 도메인 요청 등) 허용
      if (!origin) return callback(null, true);
      
      // 허용된 origin 목록에 있는지 확인
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'The Universe is Yours API is running' });
});

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api', recommendationsRoutes);
app.use('/api/vision-board', visionboardRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

