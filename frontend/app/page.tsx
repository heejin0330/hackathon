'use client';

import { useState } from 'react';
import Link from 'next/link';
import StarsBackground from '@/components/common/StarsBackground';
import { useLanguage } from '@/contexts/LanguageContext';

const LANG_COLORS: Record<string, string> = {
  ko: '#5B8DEF',
  en: '#34C759',
  es: '#FF9F0A',
  ja: '#FF453A',
};

const LANG_NAMES: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  es: 'Español',
  ja: '日本語',
};

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState(!language);
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);

  const languages: Array<'ko' | 'en' | 'es' | 'ja'> = ['ko', 'en', 'es', 'ja'];

  const handleSelectLanguage = (lang: 'ko' | 'en' | 'es' | 'ja') => {
    setLanguage(lang);
    setShowLanguageSelector(false);
  };

  return (
    <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
      <StarsBackground />
      {/* 모바일 앱 느낌의 고정 너비 컨테이너 */}
      <div className="relative z-10 w-full mx-auto px-5" style={{ maxWidth: '480px' }}>
        <div className="glass-hero shadow-2xl text-center" style={{ padding: '30px', borderRadius: '24px' }}>
          {/* 영어 메인 타이틀 */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-2" style={{ color: '#F5EFFF' }}>
            {t('app.subtitle')}
          </h1>

          {/* 한국어 서브타이틀 */}
          <p className="text-sm font-medium tracking-wide" style={{ marginBottom: '15px', color: '#F5EFFF' }}>
            {t('app.name')}
          </p>

          {/* 설명 텍스트 */}
          <p className="text-sm leading-relaxed" style={{ marginBottom: '6px', color: '#F5EFFF' }}>
            {t('app.description')}
          </p>
          <p className="text-xs" style={{ marginBottom: '30px', color: '#F5EFFF' }}>
            {t('app.description2')}
          </p>

          {/* CTA 버튼 */}
          <Link
            href={language ? "/onboarding" : "/onboarding"}
            className="btn-primary text-sm px-10 py-3"
          >
            {t('button.start')}
            <span className="ml-1.5">→</span>
          </Link>

          {/* 언어 선택 동그란 버튼들 (파란 버튼 하단) */}
          <div className="flex items-center justify-center" style={{ marginTop: '15px', gap: '15px' }}>
            {languages.filter(lang => lang !== 'en').map((lang) => {
              const isSelected = language === lang;
              const isHovered = hoveredLang === lang;
              const dotColor = LANG_COLORS[lang];

              // 선택된 언어의 자리에 영어 버튼 표시
              if (isSelected) {
                const enColor = LANG_COLORS['en'] || '#34C759';
                const isHoveringEnglish = hoveredLang === 'en';
                return (
                  <button
                    key="en"
                    onClick={() => handleSelectLanguage('en')}
                    onMouseEnter={() => setHoveredLang('en')}
                    onMouseLeave={() => setHoveredLang(null)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isHoveringEnglish
                        ? `${enColor}80`
                        : 'rgba(255, 255, 255, 0.08)',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isHoveringEnglish ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isHoveringEnglish
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : 'none',
                    }}
                    title={LANG_NAMES['en']}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#F5EFFF',
                      }}
                    >
                      EN
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={lang}
                  onClick={() => handleSelectLanguage(lang)}
                  onMouseEnter={() => setHoveredLang(lang)}
                  onMouseLeave={() => setHoveredLang(null)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: isSelected
                      ? dotColor
                      : isHovered
                        ? `${dotColor}80`
                        : 'rgba(255, 255, 255, 0.08)',
                    border: isSelected
                      ? `2px solid ${dotColor}`
                      : '2px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isSelected
                      ? `0 0 12px ${dotColor}60`
                      : isHovered
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : 'none',
                  }}
                  title={LANG_NAMES[lang]}
                >
                  {isSelected ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#F5EFFF',
                      }}
                    >
                      {lang === 'ko' ? '한' : lang === 'es' ? 'ES' : '日'}
                    </span>
                  )}
                </button>
              );
            })}
            {language === 'en' && (
              <button
                key="en"
                onClick={() => handleSelectLanguage('en')}
                onMouseEnter={() => setHoveredLang('en')}
                onMouseLeave={() => setHoveredLang(null)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: LANG_COLORS['en'] || '#34C759',
                  border: `2px solid ${LANG_COLORS['en'] || '#34C759'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: hoveredLang === 'en' ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: `0 0 12px ${LANG_COLORS['en'] || '#34C759'}60`,
                }}
                title={LANG_NAMES['en']}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
