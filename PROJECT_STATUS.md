# 프로젝트 진행 상황

## 완료된 작업 (Phase 1 MVP)

### ✅ Week 1-2: 프로젝트 초기 설정
- [x] Next.js 프론트엔드 프로젝트 생성
- [x] Express 백엔드 프로젝트 생성
- [x] TypeScript 설정 완료
- [x] ESLint, Prettier 설정
- [x] PostgreSQL + Prisma ORM 설정
- [x] 데이터베이스 스키마 정의 (모든 테이블)
- [x] Docker Compose 설정
- [x] CI/CD 파이프라인 (GitHub Actions)

### ✅ Week 3-4: 백엔드 핵심 API
- [x] 사용자 관리 API (`POST /api/users`, `GET /api/users/me`)
- [x] JWT 토큰 기반 인증 시스템
- [x] Gemini 3 API 통합
- [x] 시스템 프롬프트 정의 (PRD 13.1 기반)
- [x] 대화 세션 API (시작, 메시지 전송, 조회)
- [x] 진로 분석 API
- [x] 진로 추천 API (조회, 커스텀 추가)

### ✅ Week 5-6: 프론트엔드 핵심 기능
- [x] 온보딩 페이지 (초기 정보 입력)
- [x] 대화 인터페이스 (채팅 UI, 진행도 표시)
- [x] API 클라이언트 설정
- [x] 타입 정의

### ✅ Week 7-8: 진로 추천 및 시각화
- [x] 진로 추천 결과 페이지
- [x] 진로 카드 컴포넌트
- [x] 커스텀 진로 추가 기능
- [x] 2D 우주 시각화 (Canvas 기반)
- [x] 진로 선택 및 저장 기능

### ✅ Week 9-10: 다국어 및 접근성
- [x] 기본 i18n 구조 설정
- [x] 접근성 개선 (CSS, 키보드 네비게이션)

## 프로젝트 구조

```
hackerton/
├── frontend/              # Next.js 14 (App Router)
│   ├── app/              # 페이지
│   │   ├── onboarding/   # 온보딩
│   │   ├── conversation/ # 대화
│   │   ├── recommendations/ # 진로 추천
│   │   └── universe/     # 우주 시각화
│   ├── components/       # React 컴포넌트
│   ├── lib/             # 유틸리티
│   └── types/           # TypeScript 타입
├── backend/             # Express + TypeScript
│   ├── src/
│   │   ├── routes/      # API 라우트
│   │   ├── services/    # 비즈니스 로직
│   │   ├── middleware/  # 미들웨어
│   │   └── utils/       # 유틸리티
│   └── prisma/          # Prisma 스키마
├── docker-compose.yml   # 로컬 개발 환경
└── .github/workflows/   # CI/CD
```

## 주요 기능

### 1. 사용자 관리
- 닉네임, 나이(10-17세), 언어 선택
- JWT 토큰 기반 인증
- 닉네임 검증 (Gemini API)

### 2. AI 대화 시스템
- Gemini 3 API 통합
- 청소년 친화적 프롬프트
- 대화 진행도 추적
- 안전 필터링

### 3. 진로 추천
- 대화 기반 프로필 분석
- 3가지 진로 경로 추천
- 커스텀 진로 추가
- 상세 정보 제공

### 4. 우주 시각화
- 2D Canvas 기반 시각화
- 태양(사용자) + 행성(진로) 표현
- 인터랙티브 클릭/호버
- 애니메이션 궤도

## 완료된 작업 (Phase 2 정식 출시)

### ✅ 3D 우주 시각화
- [x] React Three Fiber + @react-three/drei 도입
- [x] 3D 태양(사용자) + 행성(진로) + 위성(직업) 시각화
- [x] OrbitControls (회전, 줌, 자동회전)
- [x] Float 애니메이션, 궤도 링, 파티클 배경
- [x] 행성 클릭 시 상세 정보 패널
- [x] SSR 비활성화 (dynamic import)

### ✅ 음성 입력/출력
- [x] Web Speech API 기반 음성 인식 (STT) 훅
- [x] Web Speech API 기반 음성 합성 (TTS) 훅
- [x] 4개 언어 음성 인식/합성 지원 (ko, en, es, ja)
- [x] ChatInterface에 마이크 버튼, TTS 토글, 메시지별 읽기 통합
- [x] 음성 인식 중 실시간 표시 (interim transcript)

### ✅ 4개 언어 완전 지원
- [x] Phase 2 신규 기능(3D, 음성, 비전보드) 번역 키 추가
- [x] 한국어, 영어, 스페인어, 일본어 전체 번역 완료

### ✅ 비전 보드 (Imagen 3)
- [x] 비전 보드 백엔드 API (생성, 조회, 목록)
- [x] 3가지 스타일 지원 (사원증, 잡지 표지, 시상식)
- [x] Gemini AI 기반 미래 비전 콘텐츠 생성
- [x] 비전 보드 프론트엔드 페이지 (스타일 선택 → 생성 → 결과 보기)
- [x] 타임라인, 성과, 영감 인용구 등 풍부한 비전 데이터

## 다음 단계

### 남은 작업 (선택사항)
- [ ] 단위 테스트 작성
- [ ] 성능 최적화 (Redis 캐싱)
- [ ] 내부 테스트 및 버그 수정
- [ ] 모바일 최적화 강화

### Phase 3 준비
- 추가 언어 지원 (중국어, 프랑스어, 독일어, 아랍어)
- 지역별 진로 정보 현지화
- 교육 기관 파트너십
- AI 개인화 고도화
- 커뮤니티 기능 (익명 진로 스토리 공유)
- 부모/교사용 인사이트 대시보드

## 실행 방법

### 1. 환경 설정
```bash
# Backend
cd backend
cp .env.example .env
# .env 파일 편집 (DATABASE_URL, GEMINI_API_KEY 등)

# Frontend
cd frontend
cp .env.example .env.local
# .env.local 파일 편집 (NEXT_PUBLIC_API_URL)
```

### 2. 데이터베이스 설정
```bash
# Docker로 PostgreSQL 실행
docker-compose up -d postgres

# Prisma 마이그레이션
cd backend
pnpm prisma migrate dev
pnpm prisma generate
```

### 3. 서버 실행
```bash
# Backend (터미널 1)
cd backend
pnpm dev

# Frontend (터미널 2)
cd frontend
pnpm dev
```

### 4. 접속
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 주의사항

1. **Gemini API 키 필요**: `.env` 파일에 `GEMINI_API_KEY` 설정 필요
2. **PostgreSQL 필요**: Docker Compose 사용 또는 로컬 PostgreSQL 설정
3. **포트 충돌**: 3000, 3001, 5432 포트가 사용 가능해야 함

## 기술 스택

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL
- **AI**: Google Gemini 3 API
- **Infrastructure**: Docker Compose, GitHub Actions

