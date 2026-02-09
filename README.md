# The Universe is Yours (너에게 우주를 줄게)

AI 기반 청소년 진로 탐색 플랫폼

## 프로젝트 개요

"The Universe is Yours"는 전 세계 청소년들이 자신의 미래에 대한 무한한 가능성을 발견하도록 돕는 AI 기반 진로 탐색 서비스입니다. Google Gemini 3 API를 활용한 대화형 상담과 우주 테마의 시각화를 제공합니다.

## 기술 스택

### Frontend
- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

### AI & Services
- Google Gemini 3 API
- Imagen 3 API (Phase 2)

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- pnpm
- PostgreSQL
- Redis (선택사항, Phase 2)

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd hackerton
```

2. 백엔드 설정
```bash
cd backend
pnpm install
cp .env.example .env
# .env 파일을 편집하여 환경 변수 설정
pnpm prisma generate
pnpm prisma migrate dev
```

3. 프론트엔드 설정
```bash
cd ../frontend
pnpm install
cp .env.example .env.local
# .env.local 파일을 편집하여 환경 변수 설정
```

### 환경 변수 설정

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/universe_yours?schema=public"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=The Universe is Yours
```

### 실행

#### 개발 모드

백엔드:
```bash
cd backend
pnpm dev
```

프론트엔드:
```bash
cd frontend
pnpm dev
```

## 프로젝트 구조

```
hackerton/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Express 백엔드
├── shared/            # 공유 타입 및 유틸리티
└── docs/              # 문서
```

## 개발 로드맵

### Phase 1: MVP (3개월)
- ✅ 프로젝트 초기 설정
- ✅ 데이터베이스 설정
- 🔄 백엔드 핵심 API 개발
- 🔄 프론트엔드 핵심 기능
- 🔄 2D 우주 시각화

### Phase 2: 정식 출시 (3개월)
- 3D 우주 시각화
- 음성 입력/출력
- 4개 언어 지원
- Imagen 3 비전 보드

### Phase 3: 글로벌 확장 (6개월)
- 추가 언어 지원
- 지역별 최적화
- 커뮤니티 기능
- 부모/교사 대시보드

## 라이선스

ISC

