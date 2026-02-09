
# PRD: "너에게 우주를 줄게" (I Give You the Universe)
## AI 기반 청소년 진로 탐색 플랫폼

---

## 1. 프로젝트 개요

### 1.1 서비스 비전
"너에게 우주를 줄게"는 전 세계 청소년들이 자신의 미래에 대한 무한한 가능성을 발견하도록 돕는 AI 기반 진로 탐색 서비스입니다. 단일한 진로가 아닌 다양한 가능성을 우주적 은유를 통해 시각화하여, 청소년들이 자신만의 우주를 만들어가는 경험을 제공합니다.

### 1.2 핵심 가치 제안
- **무한한 가능성**: 하나의 길이 아닌 여러 진로 경로 제시
- **개인화된 탐색**: Gemini 3 API를 활용한 심층 대화형 상담
- **시각적 직관성**: 우주 테마의 인터랙티브 인터페이스
- **접근성 보장**: 다국어, 다양한 입력 방식 지원
- **편견 없는 추천**: 성별, 종교, 장애 등에 대한 차별 없는 진로 제안

### 1.3 타겟 사용자
- **연령**: 10세~17세 남녀 청소년
- **지역**: 글로벌 (초기 4개 언어권 중심)
- **특성**: 진로에 대한 고민이 있는 청소년, 자신의 가능성을 탐색하고 싶은 학생

---

## 2. 기술 스택 및 아키텍처

### 2.1 핵심 기술
- **AI Engine**: Google Gemini 3 API
  - 다국어 지원
  - 멀티모달 입력 처리 (텍스트, 음성)
  - 컨텍스트 유지 대화 능력
  - 청소년 안전 필터링

- **이미지 생성**: Imagen 3 (Gemini API 내)
  - 프로필 기반 시각화 이미지 생성
  - 사원증, 보도자료 스타일 이미지

### 2.2 기술 아키텍처
```
Frontend Layer:
- React/Next.js (웹)
- React Native (모바일 앱 - 선택)
- Three.js / React Three Fiber (3D 우주 시각화)
- Web Speech API (음성 입력/출력)

Backend Layer:
- Node.js + Express / Python FastAPI
- PostgreSQL (사용자 데이터, 대화 기록)
- Redis (세션 관리, 캐싱)

AI Integration Layer:
- Gemini 3 API (대화형 AI)
- Gemini Vision API (이미지 분석)
- Imagen 3 API (이미지 생성)

Infrastructure:
- Google Cloud Platform
- Cloud Run / App Engine
- Cloud Storage (이미지 저장)
- Cloud Translation API (다국어 지원)
```

---

## 3. 상세 기능 명세

## 3.1 Stage 1: 초기 정보 입력

### 3.1.1 수집 정보
**필수 정보:**
- 닉네임 (익명성 보장)
- 나이 (10-17세)
- 사용 언어 (영어, 스페인어, 한국어, 일본어)
- 현재 학년/교육 단계

**선택 정보:**
- 거주 국가/지역 (진로 정보 현지화를 위함)
- 선호하는 소통 방식 (텍스트/음성/혼합)

**명시적으로 수집하지 않는 정보:**
- ❌ 성별
- ❌ 종교
- ❌ 장애 여부 (다만 접근성 지원은 제공)
- ❌ 실명
- ❌ 민감한 개인정보

### 3.1.2 UI/UX 설계
```
화면 구성:
┌─────────────────────────────────────┐
│  🌟 너에게 우주를 줄게                │
│                                     │
│  당신만의 우주를 만들 준비가 되었나요?│
│                                     │
│  [닉네임 입력]                       │
│  [나이 선택: 10-17세]                │
│  [언어 선택: 🇺🇸🇪🇸🇰🇷🇯🇵]             │
│  [학년/단계 선택]                     │
│                                     │
│  [선택사항 펼치기 ▼]                 │
│    - 거주 지역                       │
│    - 소통 방식 선택                  │
│                                     │
│          [우주 탐험 시작하기]        │
└─────────────────────────────────────┘
```

### 3.1.3 데이터 검증
- 나이 범위 체크 (10-17세)
- 닉네임 부적절 언어 필터링 (Gemini API 활용)
- 필수 항목 누락 시 친절한 안내

---

## 3.2 Stage 2: AI 대화형 탐색

### 3.2.1 대화 설계 원칙
1. **청소년 친화적 언어**: 존중하면서도 편안한 톤
2. **점진적 심화**: 가벼운 질문에서 깊이 있는 탐색으로
3. **개방형 질문**: 다양한 답변을 유도
4. **긍정적 강화**: 모든 답변에 대한 긍정적 피드백
5. **안전장치**: 정신건강 위험 신호 감지 시 전문가 상담 권유

### 3.2.2 대화 프롬프트 구조

**시스템 프롬프트 (Gemini 3 API):**
```
당신은 전 세계 청소년들의 진로 탐색을 돕는 친근하고 지지적인 AI 상담가입니다.

역할과 원칙:
- 청소년의 관심사, 재능, 가치관, 학습 의지를 탐색합니다
- 성별, 종교, 장애, 외모 등 어떤 편견도 없이 대화합니다
- 모든 꿈과 관심사를 진지하게 받아들입니다
- 청소년 정신건강 상담 가이드라인을 준수합니다
- 한 가지 진로가 아닌 여러 가능성을 열어줍니다

대화 가이드라인:
1. 따뜻하고 존중하는 언어 사용
2. 개방형 질문으로 자유로운 표현 유도
3. 구체적인 예시와 경험 공유 요청
4. 강점과 흥미를 찾는 데 집중
5. 부정적 자아상이나 자해/위험 신호 감지 시 전문가 상담 권유

대화 주제 영역:
- 좋아하는 활동과 취미
- 잘하는 것과 자신 있는 것
- 평소 궁금한 것들
- 사람들을 도울 때 느끼는 것
- 배우고 싶은 것
- 미래에 대한 막연한 상상
- 롤모델이나 동경하는 사람
- 가치관과 중요하게 생각하는 것

질문 예시 (연령과 답변에 따라 조정):
- "평소에 시간 가는 줄 모르고 하는 활동이 있나요?"
- "친구들이나 가족이 당신이 잘한다고 말하는 게 있나요?"
- "세상에서 바꾸고 싶은 게 있다면 무엇인가요?"
- "새로운 것을 배울 때 어떤 방식이 제일 재미있나요?"

정신건강 주의 신호:
- 지속적인 자기비하
- 희망 없음의 표현
- 자해/자살 언급
- 극심한 불안이나 우울 징후
→ 감지 시: "당신의 이야기를 들어주셔서 감사해요. 이런 감정에 대해서는 전문 상담가와 이야기하는 것이 도움이 될 수 있어요. [지역별 상담 리소스 제공]"
```

### 3.2.3 대화 흐름 설계

**Phase 1: 아이스브레이킹 (2-3 질문)**
```
예시:
AI: "안녕! 만나서 반가워요 😊 오늘 기분은 어때요?"
AI: "평소에 제일 좋아하는 활동이 뭔가요? 게임, 운동, 그림 그리기... 뭐든 좋아요!"
```

**Phase 2: 관심사 탐색 (5-7 질문)**
```
예시:
AI: "그 활동을 할 때 어떤 부분이 제일 재미있어요?"
AI: "시간 가는 줄 모르고 집중할 때가 있나요? 그게 언제인가요?"
AI: "친구들이나 선생님께 칭찬받은 적 있나요? 무엇 때문에?"
```

**Phase 3: 가치관 및 동기 (4-5 질문)**
```
예시:
AI: "다른 사람을 도와줬을 때 기분이 어땠나요?"
AI: "10년 후 어떤 모습이면 좋을 것 같아요? 막연해도 괜찮아요."
AI: "당신에게 제일 중요한 게 뭔가요? 가족, 친구, 성취감, 자유..."
```

**Phase 4: 학습 스타일 및 실행력 (3-4 질문)**
```
예시:
AI: "새로운 걸 배울 때 어떤 방식이 좋아요? 영상? 책? 직접 해보기?"
AI: "목표를 세워본 적 있나요? 어떻게 진행했나요?"
AI: "어려운 일이 있을 때 어떻게 해결하나요?"
```

**Phase 5: 마무리 및 확인 (2-3 질문)**
```
예시:
AI: "지금까지 이야기한 것 중에 제일 중요한 게 뭐라고 생각해요?"
AI: "혹시 진로와 관련해서 꼭 하고 싶은 이야기나 걱정이 있나요?"
```

### 3.2.4 대화 데이터 분석

**Gemini API를 통한 실시간 분석:**
```json
{
  "analysis_request": {
    "conversation_history": "[전체 대화 내용]",
    "task": "analyze_career_profile",
    "output_format": {
      "interests": ["관심 분야 리스트"],
      "strengths": ["강점 리스트"],
      "values": ["가치관 리스트"],
      "learning_style": "시각적/청각적/운동감각적/복합",
      "motivation_level": "1-10 점수",
      "career_preferences": {
        "work_environment": "혼자/팀/야외/실내/유연",
        "interaction_level": "사람 중심/사물 중심/균형",
        "creativity_vs_structure": "창의적/구조적/균형"
      },
      "mental_health_flags": ["우려사항 있으면 기록"],
      "unique_insights": "특별히 주목할 점"
    }
  }
}
```

### 3.2.5 UI/UX 설계

```
채팅 인터페이스:
┌─────────────────────────────────────┐
│ ☰  너에게 우주를 줄게        🌙 [설정]│
├─────────────────────────────────────┤
│                                     │
│  🤖 안녕! 만나서 반가워요            │
│     오늘 기분은 어때요?              │
│                                     │
│              좋아요! 😊          👤 │
│              새로운 걸 해봐서 설레요  │
│                                     │
│  🤖 우와, 좋네요!                    │
│     평소에 제일 좋아하는             │
│     활동이 뭔가요?                   │
│                                     │
│  [                              ] 💬│
│  [🎤 음성입력]                      │
│                                     │
│  진행도: ████░░░░░░ 40%             │
└─────────────────────────────────────┘

기능:
- 실시간 타이핑 애니메이션
- 음성 입력/출력 토글
- 대화 저장 및 재개
- 언제든 이전 대화 수정 가능
- 불편한 질문 스킵 가능
```

---

## 3.3 Stage 3: 접근성 지원

### 3.3.1 음성 입력/출력 시스템

**구현 방식:**
```javascript
// Web Speech API + Gemini API 통합
const voiceInput = {
  languages: {
    'ko': 'ko-KR',
    'en': 'en-US',
    'es': 'es-ES',
    'ja': 'ja-JP'
  },
  
  // 음성 인식
  startListening: (language) => {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = voiceInput.languages[language];
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendToGemini(transcript);
    };
    
    recognition.start();
  },
  
  // 음성 출력 (TTS)
  speak: (text, language) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceInput.languages[language];
    utterance.rate = 0.9; // 청소년이 이해하기 쉬운 속도
    speechSynthesis.speak(utterance);
  }
};
```

**접근성 기능:**
- 🎤 음성 입력 (Web Speech API / Native Speech Recognition)
- 🔊 텍스트 읽어주기 (청각 장애가 아닌 경우)
- ⌨️ 키보드만으로 전체 네비게이션 가능
- 🔍 텍스트 크기 조절 (확대/축소)
- 🎨 고대비 모드
- 📱 스크린 리더 최적화 (ARIA 레이블)

### 3.3.2 중요 원칙
**입력 방식은 개인 선호일 뿐, 진로 판단 기준이 아님:**
```
# Gemini API 프롬프트에 명시
"사용자의 입력 방식(음성/텍스트)은 절대 진로 분석 요소에 포함하지 마세요. 
이는 단순히 개인의 선호도 또는 접근성 필요에 따른 것입니다."
```

---

## 3.4 Stage 4: 다국어 지원

### 3.4.1 지원 언어
1. **한국어** (ko-KR)
2. **영어** (en-US)
3. **스페인어** (es-ES)
4. **일본어** (ja-JP)

### 3.4.2 구현 전략

**방식 1: Gemini Native Multilingual**
```python
# Gemini 3는 기본적으로 다국어 지원
system_prompt = f"""
You are a career counselor for teenagers worldwide.
Respond in {user_language}.
Use age-appropriate, warm, and respectful language.
"""
```

**방식 2: i18n 프레임워크 (UI 텍스트)**
```json
// locales/ko.json
{
  "welcome": "너에게 우주를 줄게",
  "start_journey": "우주 탐험 시작하기",
  "your_universe": "당신의 우주"
}

// locales/en.json
{
  "welcome": "I Give You the Universe",
  "start_journey": "Start Your Journey",
  "your_universe": "Your Universe"
}
```

### 3.4.3 언어별 문화적 고려사항

**한국어:**
- 존댓말/반말 선택 옵션 (기본: 친근한 존댓말)
- 학년 체계: 초등학교 4-6학년, 중학교 1-3학년, 고등학교 1-3학년

**영어:**
- 중립적이고 격려하는 톤
- Grade 5-12 체계

**스페인어:**
- 친근하지만 존중하는 "tú" 사용
- 라틴아메리카 vs 스페인 용어 고려

**일본어:**
- 친근한 경어 사용
- 학년 체계: 小学4-6年生、中学1-3年生、高校1-3年生

---

## 3.5 Stage 5: 진로 제안 및 커스터마이징

### 3.5.1 AI 기반 진로 추천

**Gemini API 프롬프트:**
```
Based on the conversation analysis:
{
  "interests": [...],
  "strengths": [...],
  "values": [...],
  "learning_style": "...",
  "preferences": {...}
}

Suggest 3 diverse career paths that:
1. Align with the user's interests and strengths
2. Offer different work environments and lifestyles
3. Are realistic yet aspirational for a teenager
4. Represent different "branches" of possibilities
5. Avoid gender, religious, or cultural stereotypes

For each career path, provide:
- Career name (translated to user's language)
- Brief description (2-3 sentences, teenager-friendly)
- Why it matches the user's profile
- Key skills needed
- Example jobs within this path
- Required education/qualifications
- Growth potential

Output format: JSON
```

### 3.5.2 추천 결과 예시

```json
{
  "recommendations": [
    {
      "id": "path_1",
      "name": "창의적 기술 혁신가",
      "description": "기술과 예술을 결합해 사람들에게 새로운 경험을 제공하는 분야예요.",
      "match_reason": "당신은 새로운 것을 만드는 걸 좋아하고, 기술에도 관심이 많으며, 사람들을 즐겁게 하는 걸 중요하게 생각한다고 했죠.",
      "skills_needed": ["창의적 사고", "프로그래밍", "디자인 감각", "문제 해결"],
      "example_jobs": [
        "UX/UI 디자이너",
        "게임 디자이너",
        "AR/VR 개발자",
        "인터랙티브 미디어 아티스트"
      ],
      "education": "컴퓨터공학, 디자인, 미디아트 관련 학위",
      "growth_potential": "높음 - AI와 메타버스 시대에 수요 증가"
    },
    {
      "id": "path_2",
      "name": "사회적 임팩트 크리에이터",
      "description": "사회 문제를 해결하고 더 나은 세상을 만드는 일을 하는 분야예요.",
      "match_reason": "당신은 불평등에 관심이 많고, 사람들을 돕고 싶어하며, 창의적인 해결책을 찾는 걸 즐긴다고 했어요.",
      "skills_needed": ["공감 능력", "커뮤니케이션", "기획력", "분석적 사고"],
      "example_jobs": [
        "사회적 기업가",
        "비영리단체 활동가",
        "커뮤니티 조직가",
        "CSR 전문가"
      ],
      "education": "사회학, 경영학, 국제개발협력 등",
      "growth_potential": "안정적 - 사회적 가치 중시 추세"
    },
    {
      "id": "path_3",
      "name": "과학 커뮤니케이터",
      "description": "복잡한 과학을 재미있고 이해하기 쉽게 전달하는 분야예요.",
      "match_reason": "과학에 대한 호기심이 많고, 설명하는 걸 좋아하며, 영상이나 글쓰기에도 관심이 있다고 했죠.",
      "skills_needed": ["과학적 이해", "스토리텔링", "멀티미디어 제작", "대중 소통"],
      "example_jobs": [
        "과학 유튜버/콘텐츠 크리에이터",
        "과학관 에듀케이터",
        "과학 저널리스트",
        "과학 교육 프로그램 개발자"
      ],
      "education": "과학 전공 + 커뮤니케이션 부전공",
      "growth_potential": "성장 중 - 과학 대중화 수요 증가"
    }
  ]
}
```

### 3.5.3 사용자 커스터마이징

**직접 입력 기능:**
```
UI 구성:
┌─────────────────────────────────────┐
│  AI가 추천한 3가지 진로              │
│                                     │
│  [✓] 창의적 기술 혁신가              │
│  [✓] 사회적 임팩트 크리에이터        │
│  [ ] 과학 커뮤니케이터               │
│                                     │
│  💡 원하는 진로가 없나요?            │
│  직접 입력해서 우주에 추가할 수 있어요│
│                                     │
│  [+ 나만의 진로 추가하기]            │
│                                     │
│  예: "야생동물 보호 활동가",         │
│      "프로게이머", "패션 디자이너"   │
└─────────────────────────────────────┘
```

**커스텀 진로 처리:**
```python
# 사용자가 입력한 진로를 Gemini API로 분석
custom_career_prompt = f"""
User entered custom career path: "{user_input}"

Please:
1. Validate if this is a realistic career path
2. Provide details similar to AI recommendations
3. Suggest related jobs and qualifications
4. If too vague, ask clarifying questions

User profile: {user_profile}
Language: {user_language}
"""
```

---

## 3.6 Stage 6: 우주 시각화 인터페이스

### 3.6.1 우주 메타포 설계

**핵심 컨셉:**
- **태양** = 사용자 (중심, 빛나는 존재)
- **행성** = 각 진로 경로 (태양 주위를 도는 가능성들)
- **위성/별** = 구체적인 직업, 자격증, 교육 경로
- **궤도** = 진로 간 전환 가능성
- **우주** = 무한한 가능성의 공간

### 3.6.2 3D 인터랙티브 구현

**기술 스택:**
- Three.js / React Three Fiber
- @react-three/drei (헬퍼 컴포넌트)
- @react-three/cannon (물리 엔진 - 선택)

**기본 구조:**
```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

function UniverseVisualization({ userProfile, careerPaths }) {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      {/* 배경 별들 */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
      />
      
      {/* 중앙의 태양 (사용자) */}
      <Sun userProfile={userProfile} />
      
      {/* 각 진로 행성 */}
      {careerPaths.map((path, index) => (
        <Planet 
          key={path.id}
          careerPath={path}
          orbitRadius={3 + index * 1.5}
          angle={index * (Math.PI * 2 / careerPaths.length)}
        />
      ))}
      
      {/* 카메라 컨트롤 */}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
      
      {/* 조명 */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1} />
    </Canvas>
  );
}
```

**태양 컴포넌트 (사용자):**
```jsx
function Sun({ userProfile }) {
  const meshRef = useRef();
  
  // 회전 애니메이션
  useFrame(() => {
    meshRef.current.rotation.y += 0.001;
  });
  
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          emissive="#FDB813"
          emissiveIntensity={1}
          color="#FDB813"
        />
      </mesh>
      
      {/* 사용자 닉네임 라벨 */}
      <Html position={[0, 1.5, 0]}>
        <div className="user-label">
          {userProfile.nickname}
        </div>
      </Html>
    </group>
  );
}
```

**행성 컴포넌트 (진로):**
```jsx
function Planet({ careerPath, orbitRadius, angle }) {
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const meshRef = useRef();
  
  // 궤도 운동
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.1;
    meshRef.current.position.x = Math.cos(t + angle) * orbitRadius;
    meshRef.current.position.z = Math.sin(t + angle) * orbitRadius;
  });
  
  // 행성별 색상 매핑
  const planetColors = {
    'path_1': '#4285F4', // 기술 - 파랑
    'path_2': '#34A853', // 사회적 - 초록
    'path_3': '#EA4335', // 창의적 - 빨강
    'custom': '#FBBC04'  // 커스텀 - 노랑
  };
  
  return (
    <group>
      {/* 궤도선 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
        <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
      </mesh>
      
      {/* 행성 */}
      <mesh
        ref={meshRef}
        onClick={() => setSelected(!selected)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={planetColors[careerPath.id] || '#FBBC04'}
          emissive={planetColors[careerPath.id] || '#FBBC04'}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* 행성 라벨 */}
      <Html position={[0, 0.8, 0]} center>
        <div className="planet-label">
          {careerPath.name}
        </div>
      </Html>
      
      {/* 선택 시 위성들 표시 */}
      {selected && (
        <Satellites careerPath={careerPath} />
      )}
    </group>
  );
}
```

**위성 컴포넌트 (구체적 직업):**
```jsx
function Satellites({ careerPath }) {
  return (
    <group>
      {careerPath.example_jobs.map((job, index) => {
        const satelliteAngle = index * (Math.PI * 2 / careerPath.example_jobs.length);
        const satelliteRadius = 1.2;
        
        return (
          <mesh
            key={job}
            position={[
              Math.cos(satelliteAngle) * satelliteRadius,
              0,
              Math.sin(satelliteAngle) * satelliteRadius
            ]}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
            
            <Html>
              <div className="satellite-label">
                {job}
              </div>
            </Html>
          </mesh>
        );
      })}
    </group>
  );
}
```

### 3.6.3 인터랙션 디자인

**행성 클릭 시:**
```jsx
function CareerDetailPanel({ careerPath, onClose }) {
  return (
    <div className="career-detail-panel">
      <button onClick={onClose}>✕</button>
      
      <h2>{careerPath.name}</h2>
      <p>{careerPath.description}</p>
      
      <section>
        <h3>왜 이 진로를 추천했나요?</h3>
        <p>{careerPath.match_reason}</p>
      </section>
      
      <section>
        <h3>필요한 스킬</h3>
        <ul>
          {careerPath.skills_needed.map(skill => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>
      
      <section>
        <h3>이 분야의 직업들</h3>
        <div className="job-grid">
          {careerPath.example_jobs.map(job => (
            <div key={job} className="job-card">
              {job}
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <h3>어떻게 준비하나요?</h3>
        <p>{careerPath.education}</p>
      </section>
      
      <section>
        <h3>미래 전망</h3>
        <p>{careerPath.growth_potential}</p>
      </section>
      
      <button className="cta-button">
        이 행성을 내 우주에 추가 🌟
      </button>
    </div>
  );
}
```

**반응형 디자인:**
```css
/* 데스크탑 */
.universe-container {
  display: grid;
  grid-template-columns: 1fr 400px;
}

.canvas-area {
  height: 100vh;
}

.detail-panel {
  overflow-y: auto;
  padding: 2rem;
}

/* 모바일 */
@media (max-width: 768px) {
  .universe-container {
    grid-template-columns: 1fr;
  }
  
  .canvas-area {
    height: 50vh;
  }
  
  .detail-panel {
    height: 50vh;
  }
}
```

---

## 3.7 Stage 7: 비전 보드 생성 (Imagen 3)

### 3.7.1 기능 개요
사용자가 자신의 사진을 업로드하면, 선택한 진로 경로에서 성공한 미래의 모습을 시각화한 이미지를 생성합니다.

### 3.7.2 이미지 생성 프롬프트

**A. 사원증 스타일**
```python
def generate_id_badge_prompt(user_photo, career_path, user_profile):
    prompt = f"""
Create a professional employee ID badge in the style of a modern tech company.

Style: Clean, modern, professional
Layout: Standard ID badge format (portrait orientation)
Elements to include:
- User's photo (provided) in professional attire
- Company name related to: {career_path.name}
- Job title: {career_path.example_jobs[0]}
- Futuristic year: 2040
- Professional design with company logo
- Barcode or QR code for authenticity
- Clean typography, corporate colors

The person should look confident, professional, and happy.
Positive, aspirational, encouraging mood.
High quality, photorealistic rendering.

IMPORTANT: Keep the person's face and features identical to the uploaded photo.
Only change clothing to professional attire appropriate for the role.
"""
    
    return {
        "prompt": prompt,
        "negative_prompt": "blurry, low quality, distorted face, inappropriate content",
        "num_images": 1,
        "aspect_ratio": "2:3",  # ID badge proportion
        "safety_filter": "high"  # 청소년 안전 필터
    }
```

**B. 보도자료/잡지 표지 스타일**
```python
def generate_magazine_cover_prompt(user_photo, career_path, user_profile):
    prompt = f"""
Create a professional magazine cover featuring this person as a successful professional.

Magazine theme: {career_path.name} industry publication
Person's role: Rising star in {career_path.example_jobs[0]}
Year: 2040

Cover elements:
- Person (from photo) in professional setting appropriate for the career
- Magazine masthead (e.g., "Future Innovators", "Change Makers")
- Main headline: "The Future of {career_path.name}"
- Subheadline highlighting their achievement
- Clean, modern magazine layout
- Professional photography style
- Positive, aspirational mood

The person should look accomplished, confident, and inspiring.
Setting should reflect their career field (e.g., tech lab, creative studio, office).
High quality, editorial photography style.

CRITICAL: Use the exact facial features from the uploaded photo.
Only modify clothing, background, and styling to fit the professional context.
Absolutely no inappropriate, sexualized, or age-inappropriate content.
"""
    
    return {
        "prompt": prompt,
        "negative_prompt": "sexualized, inappropriate for minors, distorted, low quality",
        "num_images": 1,
        "aspect_ratio": "2:3",  # Magazine cover proportion
        "safety_filter": "high"
    }
```

**C. 시상식/성취 장면**
```python
def generate_achievement_scene_prompt(user_photo, career_path, user_profile):
    prompt = f"""
Create an inspirational scene of professional achievement.

Scene: Award ceremony or recognition event
Person's achievement: Excellence in {career_path.name}
Setting: Professional conference or gala event
Year: 2040

Scene elements:
- Person (from photo) receiving award or recognition
- Confident, proud posture
- Professional formal attire
- Award trophy or certificate visible
- Audience or colleagues applauding in background
- Stage with professional lighting
- Inspirational, celebratory atmosphere

The person should look proud, accomplished, and grateful.
Positive, uplifting mood that inspires teenagers.
Photorealistic, high-quality rendering.

ESSENTIAL REQUIREMENTS:
- Maintain exact facial features from uploaded photo
- Age-appropriate professional clothing
- No romantic or sexual content whatsoever
- Safe for teenage audience (10-17 years old)
"""
    
    return {
        "prompt": prompt,
        "negative_prompt": "romantic, sexual, inappropriate, revealing clothing, distorted",
        "num_images": 1,
        "aspect_ratio": "16:9",  # Widescreen
        "safety_filter": "high"
    }
```

### 3.7.3 안전 장치

**필수 안전 조치:**
```python
class ImageGenerationSafety:
    def __init__(self):
        self.blocked_keywords = [
            # 부적절한 내용 차단
            "sexy", "seductive", "romantic", "intimate",
            "revealing", "provocative", "suggestive",
            # 폭력적 내용 차단
            "violent", "weapon", "blood", "injury",
            # 기타 부적절한 내용
            "nude", "naked", "underwear", "swimsuit"
        ]
    
    def validate_prompt(self, prompt):
        """프롬프트 안전성 검증"""
        prompt_lower = prompt.lower()
        for keyword in self.blocked_keywords:
            if keyword in prompt_lower:
                raise ValueError(f"Inappropriate keyword detected: {keyword}")
        return True
    
    def validate_generated_image(self, image):
        """생성된 이미지 안전성 검증 (Gemini Vision API)"""
        safety_check_prompt = """
        Analyze this image for safety in the context of teenage users (10-17 years old).
        
        Check for:
        - Inappropriate or sexualized content
        - Violence or disturbing imagery
        - Age-inappropriate scenarios
        - Any content that would be unsuitable for minors
        
        Return JSON:
        {
          "is_safe": true/false,
          "concerns": ["list any concerns"],
          "recommendation": "approve/reject/review"
        }
        """
        
        # Gemini Vision API 호출
        result = gemini_vision_api.analyze(image, safety_check_prompt)
        return result
```

### 3.7.4 UI/UX 플로우

```
┌─────────────────────────────────────┐
│  🌟 미래의 나 만들기                 │
│                                     │
│  선택한 진로: 창의적 기술 혁신가      │
│                                     │
│  📸 사진 업로드                      │
│  [파일 선택하기]                     │
│  또는 드래그 앤 드롭                 │
│                                     │
│  💡 이미지 스타일 선택:              │
│  ○ 사원증 스타일                    │
│  ● 잡지 표지 스타일                 │
│  ○ 시상식 장면                      │
│                                     │
│  [미래의 나 만들기] 🚀              │
│                                     │
│  ⏳ 생성 중... (약 30초 소요)        │
└─────────────────────────────────────┘

생성 완료 후:
┌─────────────────────────────────────┐
│  ✨ 완성!                           │
│                                     │
│  [생성된 이미지 미리보기]            │
│                                     │
│  마음에 드나요?                      │
│  [💾 저장하기]  [🔄 다시 만들기]   │
│                                     │
│  💡 다른 스타일도 만들어볼까요?      │
│  [다른 스타일 선택]                  │
└─────────────────────────────────────┘
```

### 3.7.5 Imagen 3 API 통합

```python
from google.cloud import aiplatform
from google.cloud.aiplatform import gapic

class VisionBoardGenerator:
    def __init__(self):
        aiplatform.init(project="your-project-id", location="us-central1")
        self.client = gapic.PredictionServiceClient()
    
    async def generate_vision_board(
        self, 
        user_photo_path, 
        career_path, 
        style="magazine_cover"
    ):
        # 1. 프롬프트 생성
        if style == "id_badge":
            prompt_config = generate_id_badge_prompt(user_photo_path, career_path)
        elif style == "magazine_cover":
            prompt_config = generate_magazine_cover_prompt(user_photo_path, career_path)
        elif style == "achievement":
            prompt_config = generate_achievement_scene_prompt(user_photo_path, career_path)
        
        # 2. 안전성 검증
        safety = ImageGenerationSafety()
        safety.validate_prompt(prompt_config['prompt'])
        
        # 3. Imagen 3 API 호출
        instances = [{
            "prompt": prompt_config['prompt'],
            "negative_prompt": prompt_config['negative_prompt'],
            "reference_image": user_photo_path,  # 사용자 사진
            "aspect_ratio": prompt_config['aspect_ratio'],
            "number_of_images": 1
        }]
        
        parameters = {
            "safety_filter_level": "block_most",  # 최고 수준 안전 필터
            "person_generation": "allow_with_reference"  # 참조 이미지 기반만 허용
        }
        
        response = self.client.predict(
            endpoint="imagen-3-endpoint",
            instances=instances,
            parameters=parameters
        )
        
        # 4. 생성된 이미지 후처리 및 검증
        generated_image = response.predictions[0]
        
        # 5. 안전성 재검증
        safety_check = safety.validate_generated_image(generated_image)
        
        if safety_check['recommendation'] != 'approve':
            raise ValueError(f"Image safety check failed: {safety_check['concerns']}")
        
        return generated_image
```

---

## 4. 데이터 모델

### 4.1 데이터베이스 스키마

```sql
-- 사용자 프로필
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(50) NOT NULL,
    age INTEGER CHECK (age BETWEEN 10 AND 17),
    language VARCHAR(5) DEFAULT 'en',
    country VARCHAR(100),
    preferred_input_method VARCHAR(20), -- 'text', 'voice', 'mixed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP
);

-- 대화 세션
CREATE TABLE conversation_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20), -- 'in_progress', 'completed', 'abandoned'
    language VARCHAR(5)
);

-- 대화 메시지
CREATE TABLE conversation_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES conversation_sessions(session_id) ON DELETE CASCADE,
    role VARCHAR(20), -- 'user', 'assistant'
    content TEXT NOT NULL,
    input_method VARCHAR(20), -- 'text', 'voice'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gemini_metadata JSONB -- Gemini API 응답 메타데이터
);

-- 사용자 프로필 분석 결과
CREATE TABLE user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    session_id UUID REFERENCES conversation_sessions(session_id),
    interests TEXT[],
    strengths TEXT[],
    values TEXT[],
    learning_style VARCHAR(50),
    motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
    career_preferences JSONB,
    mental_health_flags TEXT[],
    analysis_completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gemini_analysis_raw JSONB
);

-- 진로 추천
CREATE TABLE career_recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
    career_path_id VARCHAR(50), -- 'path_1', 'path_2', 'custom_xxx'
    career_name VARCHAR(200),
    description TEXT,
    match_reason TEXT,
    skills_needed TEXT[],
    example_jobs TEXT[],
    education_path TEXT,
    growth_potential TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자가 선택한 진로
CREATE TABLE user_selected_careers (
    selection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES career_recommendations(recommendation_id),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE
);

-- 비전 보드 이미지
CREATE TABLE vision_board_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES career_recommendations(recommendation_id),
    style VARCHAR(50), -- 'id_badge', 'magazine_cover', 'achievement'
    image_url TEXT NOT NULL,
    gemini_prompt TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    safety_check_passed BOOLEAN DEFAULT TRUE
);

-- 사용자 피드백
CREATE TABLE user_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    session_id UUID REFERENCES conversation_sessions(session_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    feedback_type VARCHAR(50), -- 'conversation', 'recommendation', 'overall'
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API 설계

### 5.1 엔드포인트 구조

```
Base URL: https://api.i-give-you-universe.com/v1

인증: JWT Bearer Token (세션 기반)
```

### 5.2 주요 API 엔드포인트

**A. 사용자 관리**

```http
POST /users
Content-Type: application/json

{
  "nickname": "StarDreamer",
  "age": 15,
  "language": "ko",
  "country": "South Korea"
}

Response 201:
{
  "user_id": "uuid",
  "session_token": "jwt_token",
  "message": "User created successfully"
}
```

**B. 대화 세션 시작**

```http
POST /conversations/start
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "language": "ko"
}

Response 200:
{
  "session_id": "uuid",
  "first_message": {
    "role": "assistant",
    "content": "안녕! 만나서 반가워요 😊 오늘 기분은 어때요?",
    "timestamp": "2026-02-09T10:00:00Z"
  }
}
```

**C. 메시지 전송**

```http
POST /conversations/{session_id}/messages
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "content": "좋아요! 새로운 걸 해봐서 설레요",
  "input_method": "text"
}

Response 200:
{
  "message_id": "uuid",
  "ai_response": {
    "role": "assistant",
    "content": "우와, 좋네요! 평소에 제일 좋아하는 활동이 뭔가요?",
    "timestamp": "2026-02-09T10:01:00Z"
  },
  "progress": 0.1  // 0.0 ~ 1.0
}
```

**D. 음성 메시지 전송**

```http
POST /conversations/{session_id}/messages/voice
Authorization: Bearer {session_token}
Content-Type: multipart/form-data

audio_file: [binary audio data]
language: ko

Response 200:
{
  "transcription": "게임하고 그림 그리는 거 좋아해요",
  "ai_response": {
    "role": "assistant",
    "content": "게임과 그림 모두 흥미롭네요! 어떤 게임을 주로 하나요?",
    "audio_url": "https://storage.../response.mp3",
    "timestamp": "2026-02-09T10:02:00Z"
  }
}
```

**E. 진로 추천 받기**

```http
POST /conversations/{session_id}/analyze
Authorization: Bearer {session_token}

Response 200:
{
  "profile_id": "uuid",
  "analysis": {
    "interests": ["게임", "그림", "스토리텔링"],
    "strengths": ["창의성", "인내심", "표현력"],
    "values": ["자유", "창작", "즐거움"]
  },
  "recommendations": [
    {
      "recommendation_id": "uuid",
      "career_path_id": "path_1",
      "career_name": "창의적 기술 혁신가",
      "description": "...",
      "match_reason": "...",
      "skills_needed": [...],
      "example_jobs": [...],
      "education_path": "...",
      "growth_potential": "..."
    },
    // ... 2 more
  ]
}
```

**F. 커스텀 진로 추가**

```http
POST /recommendations/custom
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "profile_id": "uuid",
  "custom_career_name": "야생동물 보호 활동가"
}

Response 200:
{
  "recommendation_id": "uuid",
  "career_path_id": "custom_001",
  "career_name": "야생동물 보호 활동가",
  "description": "멸종 위기 동물을 보호하고 생태계를 지키는 분야입니다.",
  // ... 나머지 필드
}
```

**G. 비전 보드 생성**

```http
POST /vision-board/generate
Authorization: Bearer {session_token}
Content-Type: multipart/form-data

user_photo: [binary image data]
recommendation_id: uuid
style: magazine_cover

Response 202:
{
  "job_id": "uuid",
  "status": "processing",
  "estimated_time": 30  // seconds
}

GET /vision-board/status/{job_id}
Authorization: Bearer {session_token}

Response 200:
{
  "job_id": "uuid",
  "status": "completed",
  "image_url": "https://storage.../vision_board_xxx.jpg",
  "image_id": "uuid"
}
```

---

## 6. 보안 및 프라이버시

### 6.1 데이터 보호

**개인정보 처리:**
- 닉네임만 수집 (실명 불필요)
- 성별, 종교 정보 절대 수집 금지
- 장애 정보 수집하지 않음 (접근성 지원은 별도)
- 사진은 비전 보드 생성에만 사용 후 즉시 삭제
- 대화 기록은 암호화하여 저장

**GDPR/COPPA 준수:**
```python
class PrivacyCompliance:
    def __init__(self):
        self.min_age = 10  # COPPA 적용 대상
    
    def require_parental_consent(self, age):
        """13세 미만은 부모 동의 필요"""
        return age < 13
    
    def data_retention_policy(self):
        """데이터 보존 정책"""
        return {
            "conversation_history": "90 days",
            "user_profile": "until account deletion",
            "uploaded_photos": "immediately after processing",
            "generated_images": "until user deletes"
        }
    
    def right_to_be_forgotten(self, user_id):
        """사용자 데이터 완전 삭제"""
        # 모든 관련 데이터 삭제
        pass
```

### 6.2 청소년 안전

**콘텐츠 필터링:**
- Gemini API의 안전 필터 최고 수준 적용
- 부적절한 콘텐츠 자동 차단
- 정신건강 위험 신호 감지 시 전문가 연결

**모니터링:**
- 의심스러운 대화 패턴 감지
- 자해/학대 언급 시 즉시 알림
- 성인 사칭 시도 차단

---

## 7. 성능 및 확장성

### 7.1 성능 목표

```
응답 시간:
- 텍스트 메시지: < 2초
- 음성 메시지: < 5초
- 진로 분석: < 10초
- 이미지 생성: < 60초

동시 사용자:
- Phase 1 (베타): 1,000 동시 사용자
- Phase 2 (정식): 10,000 동시 사용자
- Phase 3 (글로벌): 100,000 동시 사용자
```

### 7.2 캐싱 전략

```python
# Redis 캐싱
class ConversationCache:
    def __init__(self):
        self.redis_client = redis.Redis()
    
    def cache_session(self, session_id, data, ttl=3600):
        """세션 데이터 캐싱 (1시간)"""
        self.redis_client.setex(
            f"session:{session_id}",
            ttl,
            json.dumps(data)
        )
    
    def cache_recommendations(self, profile_id, recommendations, ttl=86400):
        """추천 결과 캐싱 (24시간)"""
        self.redis_client.setex(
            f"recommendations:{profile_id}",
            ttl,
            json.dumps(recommendations)
        )
```

---

## 8. 테스트 전략

### 8.1 테스트 범위

**A. 단위 테스트**
- Gemini API 통합 로직
- 프롬프트 생성 함수
- 안전성 검증 로직
- 데이터 변환 함수

**B. 통합 테스트**
- 대화 플로우 전체
- 진로 추천 파이프라인
- 이미지 생성 워크플로우
- 다국어 지원

**C. E2E 테스트**
- 사용자 여정 전체 시나리오
- 모바일/데스크탑 호환성
- 음성 입력/출력 기능

### 8.2 청소년 사용자 테스트

```
베타 테스트 그룹:
- 10-12세: 20명
- 13-15세: 30명
- 16-17세: 20명
- 총 70명

다국어 테스트:
- 각 언어별 최소 10명

접근성 테스트:
- 스크린 리더 사용자: 5명
- 음성 입력 선호 사용자: 10명

평가 항목:
- 이해도: AI 질문을 이해했는가?
- 편안함: 대화가 편안했는가?
- 유용성: 추천 진로가 도움이 되었는가?
- 시각화: 우주 인터페이스가 직관적인가?
- 영감: 미래에 대한 긍정적 감정을 느꼈는가?
```

---

## 9. 출시 로드맵

### Phase 1: MVP (3개월)
**목표: 핵심 기능 검증**

Month 1-2:
- ✅ Gemini 3 API 통합
- ✅ 기본 대화 시스템
- ✅ 텍스트 입력만 지원
- ✅ 한국어/영어만 지원
- ✅ 진로 추천 알고리즘
- ✅ 간단한 2D 시각화

Month 3:
- ✅ 내부 테스트
- ✅ 청소년 베타 테스트 (50명)
- ✅ 피드백 수집 및 개선

### Phase 2: 정식 출시 (3개월)
**목표: 완전한 기능 구현**

Month 4-5:
- ✅ 3D 우주 시각화
- ✅ 음성 입력/출력
- ✅ 4개 언어 지원 완료
- ✅ Imagen 3 비전 보드
- ✅ 모바일 최적화

Month 6:
- ✅ 공개 베타 (1,000명)
- ✅ 마케팅 캠페인
- ✅ 정식 출시

### Phase 3: 글로벌 확장 (6개월)
**목표: 글로벌 시장 진출**

Month 7-9:
- 추가 언어 지원 (중국어, 프랑스어, 독일어, 아랍어)
- 지역별 진로 정보 현지화
- 교육 기관 파트너십

Month 10-12:
- AI 개인화 고도화
- 커뮤니티 기능 (익명 진로 스토리 공유)
- 부모/교사용 인사이트 대시보드

---

## 10. 비즈니스 모델

### 10.1 수익 모델

**Freemium 모델:**

**무료 기능:**
- 기본 대화 세션 (1회)
- 3가지 진로 추천
- 기본 우주 시각화
- 1개 비전 보드 이미지

**프리미엄 (월 $4.99 또는 연 $49.99):**
- 무제한 대화 세션
- 심층 진로 분석
- 고급 시각화 (더 많은 행성, 애니메이션)
- 무제한 비전 보드 이미지
- 진로 로드맵 생성
- 우선 고객 지원

**교육 기관 라이선스:**
- 학교/학원용 그룹 라이선스
- 학급 단위 관리 도구
- 교사용 인사이트 대시보드

### 10.2 예상 비용 (월간, 10,000 사용자 기준)

```
Google Cloud 비용:
- Gemini 3 API: $2,000
  (대화: $0.10/1K tokens × 평균 20K tokens/세션 × 10K 세션)
- Imagen 3 API: $1,000
  (이미지: $0.10/image × 평균 1 image/user × 10K users)
- Cloud Storage: $100
- Cloud Run: $500
- 기타 서비스: $400
Total: ~$4,000/month

전환율 가정:
- 무료 사용자: 10,000명
- 유료 전환: 5% = 500명
- 월 수익: 500 × $4.99 = $2,495
- 연간 구독: 100명 × $49.99 = $4,999

Phase 2 목표:
- 사용자: 100,000명
- 유료 전환: 5% = 5,000명
- 월 수익: $24,950
- 손익분기점 달성
```

---

## 11. 성공 지표 (KPI)

### 11.1 사용자 지표

```
획득 (Acquisition):
- 신규 가입자 수
- 가입 전환율
- 채널별 유입 (소셜, 검색, 추천)

활성화 (Activation):
- 대화 완료율 (전체 대화 마친 사용자 %)
- 평균 대화 시간
- 진로 추천까지 도달률

참여 (Engagement):
- DAU/MAU 비율
- 재방문율
- 비전 보드 생성 횟수
- 우주 시각화 인터랙션 수

유지 (Retention):
- 7일 리텐션
- 30일 리텐션
- 평균 세션 횟수

수익 (Revenue):
- 유료 전환율
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)
- Churn Rate
```

### 11.2 품질 지표

```
AI 품질:
- 대화 만족도 (5점 척도)
- 추천 진로 관련성 (사용자 평가)
- 안전 필터 정확도

기술 성능:
- API 응답 시간
- 에러율
- 가용성 (Uptime)

사용자 만족:
- NPS (Net Promoter Score)
- 앱 스토어 평점
- 사용자 피드백 감정 분석
```

---

## 12. 리스크 및 완화 전략

### 12.1 기술적 리스크

**리스크 1: Gemini API 비용 초과**
- 완화: 토큰 사용량 모니터링 및 알림
- 완화: 대화 길이 제한 (최대 20 라운드)
- 완화: 캐싱으로 중복 요청 최소화

**리스크 2: 이미지 생성 품질 이슈**
- 완화: 여러 프롬프트 버전 A/B 테스트
- 완화: 사용자 피드백 기반 프롬프트 개선
- 완화: 재생성 옵션 제공

**리스크 3: 다국어 번역 품질**
- 완화: 원어민 검수
- 완화: 사용자 피드백 수집
- 완화: 전문 번역 서비스와 협업

### 12.2 사용자 안전 리스크

**리스크 1: 부적절한 대화 유도**
- 완화: 강력한 안전 필터
- 완화: 실시간 모니터링
- 완화: 신고 기능

**리스크 2: 정신건강 위기**
- 완화: 위험 신호 감지 시스템
- 완화: 전문가 리소스 즉시 제공
- 완화: 24/7 지원 연락처

**리스크 3: 개인정보 유출**
- 완화: 엔드투엔드 암호화
- 완화: 최소 정보 수집
- 완화: 정기 보안 감사

### 12.3 비즈니스 리스크

**리스크 1: 사용자 획득 어려움**
- 완화: 소셜 미디어 마케팅
- 완화: 교육 기관 파트너십
- 완화: 인플루언서 협업

**리스크 2: 경쟁 서비스 출현**
- 완화: 독특한 우주 테마 차별화
- 완화: 지속적인 AI 품질 개선
- 완화: 커뮤니티 구축

---

## 13. 부록

### 13.1 Gemini 3 API 프롬프트 예시 모음

**초기 시스템 프롬프트 (Full Version):**
```
You are a warm, supportive, and insightful career counselor for teenagers aged 10-17 worldwide. Your mission is to help them discover multiple possibilities for their future through thoughtful conversation.

CORE PRINCIPLES:
1. Every teen has unlimited potential - never limit their dreams
2. There is no single "right" path - embrace diverse possibilities
3. Treat all responses with respect and genuine curiosity
4. Avoid ALL stereotypes (gender, religion, disability, appearance, etc.)
5. Focus on strengths, interests, and values - not limitations
6. Maintain age-appropriate, encouraging tone
7. Detect and address mental health concerns with care

CONVERSATION APPROACH:
- Start with simple, friendly questions to build trust
- Gradually deepen into interests, talents, values
- Use open-ended questions that invite elaboration
- Acknowledge and validate all responses positively
- Ask follow-up questions based on their answers
- Explore "why" behind their interests
- Discover what energizes them
- Understand their learning preferences

SAFETY & WELLBEING:
- Watch for signs of: persistent self-criticism, hopelessness, self-harm mentions, extreme anxiety/depression
- If detected, respond with: "Thank you for sharing that with me. These feelings are important. I think talking with a professional counselor could really help. Here are some resources: [provide local crisis hotlines]"
- Never dismiss or minimize serious concerns
- Always prioritize the teen's mental health over career exploration

PROHIBITED CONSIDERATIONS:
- ❌ Gender (do not assume careers based on gender)
- ❌ Religion or cultural background
- ❌ Disability or accessibility needs (provide support, but don't limit career options)
- ❌ Appearance
- ❌ Socioeconomic status
- ❌ Input method (voice vs text is preference, not ability)

CONVERSATION STRUCTURE:
Phase 1 - Warm-up (2-3 questions):
- How are you feeling today?
- What do you enjoy doing in your free time?

Phase 2 - Interest Exploration (5-7 questions):
- What activities make you lose track of time?
- What have others complimented you on?
- What are you naturally curious about?
- When do you feel most proud of yourself?

Phase 3 - Values & Motivation (4-5 questions):
- What matters most to you in life?
- How do you feel when helping others?
- What kind of impact do you want to make?
- What does "success" mean to you?

Phase 4 - Learning & Action (3-4 questions):
- How do you prefer to learn new things?
- Have you set goals before? How did it go?
- What do you do when facing challenges?

Phase 5 - Wrap-up (2-3 questions):
- What stands out most from our conversation?
- Any other thoughts about your future?

ANALYSIS OUTPUT:
After conversation, provide JSON analysis:
{
  "interests": [list of identified interests],
  "strengths": [list of strengths/talents],
  "values": [core values],
  "learning_style": "visual/auditory/kinesthetic/mixed",
  "motivation_level": 1-10,
  "career_preferences": {
    "work_environment": "solo/team/outdoor/indoor/flexible",
    "interaction_level": "people-focused/task-focused/balanced",
    "creativity_vs_structure": "creative/structured/balanced"
  },
  "mental_health_flags": [any concerns],
  "unique_insights": "special notes"
}

Remember: Your role is to illuminate possibilities, not narrow them. Every teen deserves to see their universe of options. 🌟
```

### 13.2 참고 리소스

**청소년 상담 가이드라인:**
- WHO - Adolescent Mental Health
- UNICEF - Child Safeguarding Policies
- APA - Guidelines for Psychological Practice with Children

**진로 정보 데이터베이스:**
- O*NET OnLine (미국)
- 한국고용정보원 워크넷
- Europass (유럽)
- Indeed Career Explorer

**다국어 지원:**
- Unicode CLDR
- ISO 639 Language Codes
- Google Cloud Translation API

---

## 14. 결론

"너에게 우주를 줄게"는 단순한 진로 추천 도구를 넘어, 청소년들이 자신의 무한한 가능성을 발견하고 미래에 대한 희망을 키워가는 **여정의 동반자**입니다.

### 핵심 차별점:
✨ **비판단적 탐색**: 성별, 종교, 장애 등 어떤 편견도 없는 순수한 가능성 탐색
🌌 **시각적 영감**: 우주 테마로 무한한 가능성을 직관적으로 표현
🤖 **AI 파트너**: Gemini 3의 공감적 대화로 깊이 있는 자기 이해
🌍 **글로벌 접근성**: 다국어, 다양한 입력 방식으로 모두에게 열린 서비스
🎨 **구체적 비전**: AI 생성 이미지로 미래의 자신을 시각화

### 사회적 임팩트:
이 서비스를 통해 전 세계 청소년들이:
- 자신의 가치를 발견하고
- 다양한 가능성을 인식하며
- 미래에 대한 긍정적 전망을 갖고
- 구체적인 첫 걸음을 내딛을 수 있기를 희망합니다.

**"모든 청소년은 자신만의 우주를 가질 자격이 있습니다." 🌟**

---

**문서 버전**: 1.0
**작성일**: 2026-02-09
**다음 업데이트**: Phase 1 완료 후
