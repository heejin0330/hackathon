'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ko' | 'en' | 'es' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ko: {
    // Common
    'app.name': '너에게 우주를 줄게',
    'app.subtitle': 'The Universe is Yours',
    'app.description': 'AI 기반 청소년 진로 탐색 플랫폼',
    'app.description2': '당신만의 무한한 가능성을 발견하세요',
    'button.start': '우주 탐험 시작하기',
    'button.submit': '제출',
    'button.cancel': '취소',
    'button.back': '돌아가기',
    'button.continue': '계속하기',
    'button.select': '선택하기',
    'button.selected': '선택됨',
    'button.add': '추가하기',
    'button.close': '닫기',
    
    // Onboarding
    'onboarding.title': '너에게 우주를 줄게',
    'onboarding.subtitle': 'The Universe is Yours',
    'onboarding.question': '당신만의 우주를 만들 준비가 되었나요?',
    'onboarding.nickname': '닉네임',
    'onboarding.nickname.placeholder': '닉네임을 입력하세요',
    'onboarding.age': '나이',
    'onboarding.age.range': '나이 * (10-17세)',
    'onboarding.language': '언어',
    'onboarding.grade': '학년/교육 단계',
    'onboarding.grade.placeholder': '예: 중학교 2학년',
    'onboarding.optional': '선택사항 펼치기',
    'onboarding.country': '거주 지역',
    'onboarding.country.placeholder': '예: 대한민국',
    'onboarding.inputMethod': '선호하는 소통 방식',
    'onboarding.inputMethod.text': '텍스트',
    'onboarding.inputMethod.voice': '음성',
    'onboarding.inputMethod.mixed': '혼합',
    'onboarding.error.nickname': '닉네임을 입력해주세요',
    'onboarding.error.age': '나이는 10세부터 17세까지 가능합니다',
    'onboarding.error.create': '사용자 생성에 실패했습니다',
    
    // Conversation
    'conversation.title': '너에게 우주를 줄게',
    'conversation.progress': '진행도',
    'conversation.input.placeholder': '메시지를 입력하세요...',
    'conversation.loading': '우주 탐험 준비 중...',
    'conversation.error.start': '대화를 시작할 수 없습니다',
    'conversation.error.analyze': '분석 중 오류가 발생했습니다',
    'conversation.restart': '다시 시작하기',
    
    // Recommendations
    'recommendations.title': '당신의 우주가 준비되었습니다',
    'recommendations.subtitle': 'AI가 추천한 {count}가지 진로 경로를 확인해보세요',
    'recommendations.custom.title': '원하는 진로가 없나요?',
    'recommendations.custom.description': '직접 입력해서 우주에 추가할 수 있어요',
    'recommendations.custom.add': '나만의 진로 추가하기',
    'recommendations.custom.placeholder': '예: 야생동물 보호 활동가, 프로게이머, 패션 디자이너',
    'recommendations.custom.adding': '추가 중...',
    'recommendations.selected': '{count}개의 진로를 선택했습니다',
    'recommendations.view': '우주 시각화 보기',
    'recommendations.error.load': '추천을 불러올 수 없습니다',
    'recommendations.error.profile': '프로필 ID가 필요합니다',
    'recommendations.error.select': '최소 하나의 진로를 선택해주세요',
    'recommendations.loading': '진로 추천 생성 중...',
    
    // Career Card
    'career.why': '왜 이 진로를 추천했나요?',
    'career.skills': '필요한 스킬',
    'career.jobs': '이 분야의 직업들',
    'career.education': '어떻게 준비하나요?',
    'career.growth': '미래 전망',
    'career.details': '자세히 보기',
    'career.hide': '간략히',
    'career.custom': '커스텀',
    
    // Universe
    'universe.title': '당신의 우주',
    'universe.description': '중앙의 태양은 당신이고, 주변의 행성들은 진로 경로입니다',
    'universe.loading': '우주 생성 중...',
    'universe.controls': '드래그: 회전 | 스크롤: 줌 | 행성 클릭: 상세',
    'universe.visionBoard': '미래의 나 만들기',
    
    // Voice
    'conversation.voice.listening': '듣고 있어요...',
    'conversation.voice.speaking': '말씀하세요...',
    'conversation.voice.autoOn': 'AI 음성 출력 켜기',
    'conversation.voice.autoOff': 'AI 음성 출력 끄기',
    
    // Vision Board
    'visionBoard.title': '미래의 나',
    'visionBoard.subtitle': '선택한 진로에서 성공한 미래의 모습을 확인해보세요',
    'visionBoard.upload': '사진 업로드',
    'visionBoard.upload.description': '사진을 업로드하면 더 나은 결과를 얻을 수 있어요 (선택)',
    'visionBoard.style': '이미지 스타일 선택',
    'visionBoard.style.id_badge': '사원증 스타일',
    'visionBoard.style.magazine_cover': '잡지 표지 스타일',
    'visionBoard.style.achievement': '시상식 장면',
    'visionBoard.generate': '미래의 나 만들기',
    'visionBoard.generating': '생성 중... (약 30초 소요)',
    'visionBoard.result': '완성!',
    'visionBoard.save': '저장하기',
    'visionBoard.retry': '다시 만들기',
    'visionBoard.otherStyle': '다른 스타일 선택',
    'visionBoard.error': '이미지 생성에 실패했습니다',
    
    // Language Selection
    'language.title': '언어를 선택해주세요',
    'language.subtitle': 'Select your language',
    'language.ko': '한국어',
    'language.en': 'English',
    'language.es': 'Español',
    'language.ja': '日本語',
  },
  en: {
    // Common
    'app.name': '너에게 우주를 줄게',
    'app.subtitle': 'The Universe is Yours',
    'app.description': 'AI-based Career Exploration Platform for Teens',
    'app.description2': 'Discover your infinite possibilities',
    'button.start': 'Start Exploring',
    'button.submit': 'Submit',
    'button.cancel': 'Cancel',
    'button.back': 'Back',
    'button.continue': 'Continue',
    'button.select': 'Select',
    'button.selected': 'Selected',
    'button.add': 'Add',
    'button.close': 'Close',
    
    // Onboarding
    'onboarding.title': '너에게 우주를 줄게',
    'onboarding.subtitle': 'The Universe is Yours',
    'onboarding.question': 'Are you ready to create your own universe?',
    'onboarding.nickname': 'Nickname',
    'onboarding.nickname.placeholder': 'Enter your nickname',
    'onboarding.age': 'Age',
    'onboarding.age.range': 'Age * (10-17 years)',
    'onboarding.language': 'Language',
    'onboarding.grade': 'Grade/Education Level',
    'onboarding.grade.placeholder': 'e.g., Middle School 2nd Grade',
    'onboarding.optional': 'Show Optional Fields',
    'onboarding.country': 'Country/Region',
    'onboarding.country.placeholder': 'e.g., South Korea',
    'onboarding.inputMethod': 'Preferred Communication Method',
    'onboarding.inputMethod.text': 'Text',
    'onboarding.inputMethod.voice': 'Voice',
    'onboarding.inputMethod.mixed': 'Mixed',
    'onboarding.error.nickname': 'Please enter your nickname',
    'onboarding.error.age': 'Age must be between 10 and 17',
    'onboarding.error.create': 'Failed to create user',
    
    // Conversation
    'conversation.title': '너에게 우주를 줄게',
    'conversation.progress': 'Progress',
    'conversation.input.placeholder': 'Type your message...',
    'conversation.loading': 'Preparing for exploration...',
    'conversation.error.start': 'Failed to start conversation',
    'conversation.error.analyze': 'Error occurred during analysis',
    'conversation.restart': 'Start Over',
    
    // Recommendations
    'recommendations.title': 'Your Universe is Ready',
    'recommendations.subtitle': 'Check out {count} career paths recommended by AI',
    'recommendations.custom.title': 'Don\'t see your dream career?',
    'recommendations.custom.description': 'You can add your own career to the universe',
    'recommendations.custom.add': '+ Add Custom Career',
    'recommendations.custom.placeholder': 'e.g., Wildlife Conservationist, Pro Gamer, Fashion Designer',
    'recommendations.custom.adding': 'Adding...',
    'recommendations.selected': 'Selected {count} career(s)',
    'recommendations.view': 'View Universe',
    'recommendations.error.load': 'Failed to load recommendations',
    'recommendations.error.profile': 'Profile ID is required',
    'recommendations.error.select': 'Please select at least one career',
    'recommendations.loading': 'Generating recommendations...',
    
    // Career Card
    'career.why': 'Why this career?',
    'career.skills': 'Required Skills',
    'career.jobs': 'Jobs in this field',
    'career.education': 'How to prepare',
    'career.growth': 'Future Outlook',
    'career.details': 'View Details',
    'career.hide': 'Hide',
    'career.custom': 'Custom',
    
    // Universe
    'universe.title': 'Your Universe',
    'universe.description': 'The sun in the center is you, and the planets around are your career paths',
    'universe.loading': 'Creating universe...',
    'universe.controls': 'Drag: Rotate | Scroll: Zoom | Click planet: Details',
    'universe.visionBoard': 'Create Future Me',
    
    // Voice
    'conversation.voice.listening': 'Listening...',
    'conversation.voice.speaking': 'Speak now...',
    'conversation.voice.autoOn': 'Enable AI voice',
    'conversation.voice.autoOff': 'Disable AI voice',
    
    // Vision Board
    'visionBoard.title': 'Future Me',
    'visionBoard.subtitle': 'See your future self succeeding in your chosen career path',
    'visionBoard.upload': 'Upload Photo',
    'visionBoard.upload.description': 'Upload a photo for better results (optional)',
    'visionBoard.style': 'Choose Image Style',
    'visionBoard.style.id_badge': 'ID Badge Style',
    'visionBoard.style.magazine_cover': 'Magazine Cover Style',
    'visionBoard.style.achievement': 'Achievement Scene',
    'visionBoard.generate': 'Create Future Me',
    'visionBoard.generating': 'Generating... (about 30 seconds)',
    'visionBoard.result': 'Done!',
    'visionBoard.save': 'Save',
    'visionBoard.retry': 'Try Again',
    'visionBoard.otherStyle': 'Choose Another Style',
    'visionBoard.error': 'Failed to generate image',
    
    // Language Selection
    'language.title': 'Select your language',
    'language.subtitle': '언어를 선택해주세요',
    'language.ko': '한국어',
    'language.en': 'English',
    'language.es': 'Español',
    'language.ja': '日本語',
  },
  es: {
    // Common
    'app.name': '너에게 우주를 줄게',
    'app.subtitle': 'The Universe is Yours',
    'app.description': 'Plataforma de Exploración de Carreras con IA para Adolescentes',
    'app.description2': 'Descubre tus infinitas posibilidades',
    'button.start': 'Comenzar Exploración',
    'button.submit': 'Enviar',
    'button.cancel': 'Cancelar',
    'button.back': 'Volver',
    'button.continue': 'Continuar',
    'button.select': 'Seleccionar',
    'button.selected': 'Seleccionado',
    'button.add': 'Agregar',
    'button.close': 'Cerrar',
    
    // Onboarding
    'onboarding.title': '너에게 우주를 줄게',
    'onboarding.subtitle': 'The Universe is Yours',
    'onboarding.question': '¿Estás listo para crear tu propio universo?',
    'onboarding.nickname': 'Apodo',
    'onboarding.nickname.placeholder': 'Ingresa tu apodo',
    'onboarding.age': 'Edad',
    'onboarding.age.range': 'Edad * (10-17 años)',
    'onboarding.language': 'Idioma',
    'onboarding.grade': 'Grado/Nivel Educativo',
    'onboarding.grade.placeholder': 'ej., Segundo año de secundaria',
    'onboarding.optional': 'Mostrar Campos Opcionales',
    'onboarding.country': 'País/Región',
    'onboarding.country.placeholder': 'ej., Corea del Sur',
    'onboarding.inputMethod': 'Método de Comunicación Preferido',
    'onboarding.inputMethod.text': 'Texto',
    'onboarding.inputMethod.voice': 'Voz',
    'onboarding.inputMethod.mixed': 'Mixto',
    'onboarding.error.nickname': 'Por favor ingresa tu apodo',
    'onboarding.error.age': 'La edad debe estar entre 10 y 17 años',
    'onboarding.error.create': 'Error al crear usuario',
    
    // Conversation
    'conversation.title': '너에게 우주를 줄게',
    'conversation.progress': 'Progreso',
    'conversation.input.placeholder': 'Escribe tu mensaje...',
    'conversation.loading': 'Preparando exploración...',
    'conversation.error.start': 'Error al iniciar conversación',
    'conversation.error.analyze': 'Error durante el análisis',
    'conversation.restart': 'Empezar de Nuevo',
    
    // Recommendations
    'recommendations.title': 'Tu Universo Está Listo',
    'recommendations.subtitle': 'Revisa {count} caminos profesionales recomendados por IA',
    'recommendations.custom.title': '¿No ves tu carrera soñada?',
    'recommendations.custom.description': 'Puedes agregar tu propia carrera al universo',
    'recommendations.custom.add': '+ Agregar Carrera Personalizada',
    'recommendations.custom.placeholder': 'ej., Conservacionista de Vida Silvestre, Jugador Profesional, Diseñador de Moda',
    'recommendations.custom.adding': 'Agregando...',
    'recommendations.selected': 'Seleccionaste {count} carrera(s)',
    'recommendations.view': 'Ver Universo',
    'recommendations.error.load': 'Error al cargar recomendaciones',
    'recommendations.error.profile': 'Se requiere ID de perfil',
    'recommendations.error.select': 'Por favor selecciona al menos una carrera',
    'recommendations.loading': 'Generando recomendaciones...',
    
    // Career Card
    'career.why': '¿Por qué esta carrera?',
    'career.skills': 'Habilidades Requeridas',
    'career.jobs': 'Trabajos en este campo',
    'career.education': 'Cómo prepararse',
    'career.growth': 'Perspectiva Futura',
    'career.details': 'Ver Detalles',
    'career.hide': 'Ocultar',
    'career.custom': 'Personalizado',
    
    // Universe
    'universe.title': 'Tu Universo',
    'universe.description': 'El sol en el centro eres tú, y los planetas alrededor son tus caminos profesionales',
    'universe.loading': 'Creando universo...',
    'universe.controls': 'Arrastrar: Rotar | Scroll: Zoom | Clic en planeta: Detalles',
    'universe.visionBoard': 'Crear Mi Futuro',
    
    // Voice
    'conversation.voice.listening': 'Escuchando...',
    'conversation.voice.speaking': 'Habla ahora...',
    'conversation.voice.autoOn': 'Activar voz de IA',
    'conversation.voice.autoOff': 'Desactivar voz de IA',
    
    // Vision Board
    'visionBoard.title': 'Mi Futuro',
    'visionBoard.subtitle': 'Mira tu futuro yo teniendo éxito en tu carrera elegida',
    'visionBoard.upload': 'Subir Foto',
    'visionBoard.upload.description': 'Sube una foto para mejores resultados (opcional)',
    'visionBoard.style': 'Elige el Estilo de Imagen',
    'visionBoard.style.id_badge': 'Estilo de Credencial',
    'visionBoard.style.magazine_cover': 'Portada de Revista',
    'visionBoard.style.achievement': 'Escena de Premio',
    'visionBoard.generate': 'Crear Mi Futuro',
    'visionBoard.generating': 'Generando... (aproximadamente 30 segundos)',
    'visionBoard.result': '¡Listo!',
    'visionBoard.save': 'Guardar',
    'visionBoard.retry': 'Intentar de Nuevo',
    'visionBoard.otherStyle': 'Elegir Otro Estilo',
    'visionBoard.error': 'Error al generar la imagen',
    
    // Language Selection
    'language.title': 'Selecciona tu idioma',
    'language.subtitle': '언어를 선택해주세요',
    'language.ko': '한국어',
    'language.en': 'English',
    'language.es': 'Español',
    'language.ja': '日本語',
  },
  ja: {
    // Common
    'app.name': '너에게 우주를 줄게',
    'app.subtitle': 'The Universe is Yours',
    'app.description': 'AIベースの10代向けキャリア探索プラットフォーム',
    'app.description2': '無限の可能性を発見しましょう',
    'button.start': '探索を始める',
    'button.submit': '送信',
    'button.cancel': 'キャンセル',
    'button.back': '戻る',
    'button.continue': '続ける',
    'button.select': '選択',
    'button.selected': '選択済み',
    'button.add': '追加',
    'button.close': '閉じる',
    
    // Onboarding
    'onboarding.title': '너에게 우주를 줄게',
    'onboarding.subtitle': 'The Universe is Yours',
    'onboarding.question': '自分の宇宙を作る準備はできていますか？',
    'onboarding.nickname': 'ニックネーム',
    'onboarding.nickname.placeholder': 'ニックネームを入力してください',
    'onboarding.age': '年齢',
    'onboarding.age.range': '年齢 * (10-17歳)',
    'onboarding.language': '言語',
    'onboarding.grade': '学年/教育レベル',
    'onboarding.grade.placeholder': '例：中学校2年生',
    'onboarding.optional': 'オプション項目を表示',
    'onboarding.country': '国/地域',
    'onboarding.country.placeholder': '例：大韓民国',
    'onboarding.inputMethod': '希望するコミュニケーション方法',
    'onboarding.inputMethod.text': 'テキスト',
    'onboarding.inputMethod.voice': '音声',
    'onboarding.inputMethod.mixed': '混合',
    'onboarding.error.nickname': 'ニックネームを入力してください',
    'onboarding.error.age': '年齢は10歳から17歳までです',
    'onboarding.error.create': 'ユーザー作成に失敗しました',
    
    // Conversation
    'conversation.title': '너에게 우주를 줄게',
    'conversation.progress': '進捗',
    'conversation.input.placeholder': 'メッセージを入力...',
    'conversation.loading': '探索の準備中...',
    'conversation.error.start': '会話を開始できませんでした',
    'conversation.error.analyze': '分析中にエラーが発生しました',
    'conversation.restart': '最初からやり直す',
    
    // Recommendations
    'recommendations.title': 'あなたの宇宙が準備できました',
    'recommendations.subtitle': 'AIが推奨する{count}つのキャリアパスを確認してください',
    'recommendations.custom.title': '夢のキャリアが見つかりませんか？',
    'recommendations.custom.description': '自分のキャリアを宇宙に追加できます',
    'recommendations.custom.add': '+ カスタムキャリアを追加',
    'recommendations.custom.placeholder': '例：野生動物保護活動家、プロゲーマー、ファッションデザイナー',
    'recommendations.custom.adding': '追加中...',
    'recommendations.selected': '{count}つのキャリアを選択しました',
    'recommendations.view': '宇宙を表示',
    'recommendations.error.load': '推奨事項を読み込めませんでした',
    'recommendations.error.profile': 'プロフィールIDが必要です',
    'recommendations.error.select': '少なくとも1つのキャリアを選択してください',
    'recommendations.loading': '推奨事項を生成中...',
    
    // Career Card
    'career.why': 'なぜこのキャリア？',
    'career.skills': '必要なスキル',
    'career.jobs': 'この分野の職業',
    'career.education': '準備方法',
    'career.growth': '将来の見通し',
    'career.details': '詳細を見る',
    'career.hide': '非表示',
    'career.custom': 'カスタム',
    
    // Universe
    'universe.title': 'あなたの宇宙',
    'universe.description': '中央の太陽はあなたで、周りの惑星はキャリアパスです',
    'universe.loading': '宇宙を作成中...',
    'universe.controls': 'ドラッグ: 回転 | スクロール: ズーム | 惑星クリック: 詳細',
    'universe.visionBoard': '未来の自分を作る',
    
    // Voice
    'conversation.voice.listening': '聞いています...',
    'conversation.voice.speaking': '話してください...',
    'conversation.voice.autoOn': 'AI音声をオンにする',
    'conversation.voice.autoOff': 'AI音声をオフにする',
    
    // Vision Board
    'visionBoard.title': '未来の自分',
    'visionBoard.subtitle': '選んだキャリアパスで成功した未来の自分を見てみましょう',
    'visionBoard.upload': '写真をアップロード',
    'visionBoard.upload.description': '写真をアップロードするとより良い結果が得られます（オプション）',
    'visionBoard.style': '画像スタイルを選択',
    'visionBoard.style.id_badge': '社員証スタイル',
    'visionBoard.style.magazine_cover': '雑誌の表紙スタイル',
    'visionBoard.style.achievement': '受賞シーン',
    'visionBoard.generate': '未来の自分を作る',
    'visionBoard.generating': '生成中...（約30秒）',
    'visionBoard.result': '完成！',
    'visionBoard.save': '保存',
    'visionBoard.retry': 'やり直す',
    'visionBoard.otherStyle': '別のスタイルを選択',
    'visionBoard.error': '画像の生成に失敗しました',
    
    // Language Selection
    'language.title': '言語を選択してください',
    'language.subtitle': '언어를 선택해주세요',
    'language.ko': '한국어',
    'language.en': 'English',
    'language.es': 'Español',
    'language.ja': '日本語',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 최초 언어는 영어(en)로 설정
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // localStorage에서 언어 불러오기
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && ['ko', 'en', 'es', 'ja'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key as keyof typeof translations.ko] || key;
    
    // 파라미터 치환 (예: {count} -> 실제 값)
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  // 언어가 초기화되기 전에는 로딩 상태
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

