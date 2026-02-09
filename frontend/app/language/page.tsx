'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import StarsBackground from '@/components/common/StarsBackground';

const LANG_COLORS: Record<string, string> = {
  ko: '#5B8DEF',
  en: '#34C759',
  es: '#FF9F0A',
  ja: '#FF453A',
};

export default function LanguagePage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);

  const languages = [
    { code: 'ko' as const, name: '한국어' },
    { code: 'en' as const, name: 'English' },
    { code: 'es' as const, name: 'Español' },
    { code: 'ja' as const, name: '日本語' },
  ];

  const handleSelectLanguage = (lang: 'ko' | 'en' | 'es' | 'ja') => {
    setLanguage(lang);
    router.push('/onboarding');
  };

  return (
    <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
      <StarsBackground />
      {/* 모바일 앱 느낌의 고정 너비 컨테이너 */}
      <div className="relative z-10 w-full mx-auto px-5" style={{ maxWidth: '480px' }}>
        <div className="glass-hero shadow-2xl" style={{ padding: '30px', borderRadius: '24px' }}>
          {/* 타이틀 */}
          <h1 className="text-2xl font-bold text-white text-center tracking-tight" style={{ marginBottom: '4px' }}>
            Select your language
          </h1>
          <p className="text-xs text-white text-center" style={{ marginBottom: '15px' }}>
            언어를 선택해주세요
          </p>

          {/* 언어 리스트 */}
          <div className="flex flex-col" style={{ gap: '15px' }}>
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              const isHovered = hoveredLang === lang.code;
              const dotColor = LANG_COLORS[lang.code];

              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  onMouseEnter={() => setHoveredLang(lang.code)}
                  onMouseLeave={() => setHoveredLang(null)}
                  className="lang-item h-14"
                  style={{
                    background: isSelected
                      ? 'rgba(255, 255, 255, 0.14)'
                      : isHovered
                        ? 'rgba(255, 255, 255, 0.10)'
                        : 'rgba(255, 255, 255, 0.05)',
                    boxShadow: isSelected
                      ? '0 0 0 1px rgba(255, 255, 255, 0.20)'
                      : isHovered
                        ? '0 0 0 1px rgba(255, 255, 255, 0.10)'
                        : 'none',
                  }}
                >
                  {/* 왼쪽: 컬러 도트 + 언어 이름 */}
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: dotColor,
                        opacity: isSelected ? 1 : 0.5,
                        transition: 'opacity 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: '#ffffff',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {lang.name}
                    </span>
                  </div>

                  {/* 오른쪽: 체크 아이콘 */}
                  {isSelected ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0064FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div style={{ width: '16px', height: '16px' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
