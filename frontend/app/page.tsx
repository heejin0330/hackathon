'use client';

import Link from 'next/link';
import StarsBackground from '@/components/common/StarsBackground';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
      <StarsBackground />
      {/* 모바일 앱 느낌의 고정 너비 컨테이너 */}
      <div className="relative z-10 w-full mx-auto px-5" style={{ maxWidth: '480px' }}>
        <div className="glass-hero shadow-2xl text-center" style={{ padding: '30px', borderRadius: '24px' }}>
          {/* 영어 메인 타이틀 */}
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-2">
            {t('app.subtitle')}
          </h1>

          {/* 한국어 서브타이틀 */}
          <p className="text-sm text-white font-medium tracking-wide" style={{ marginBottom: '15px' }}>
            {t('app.name')}
          </p>

          {/* 설명 텍스트 */}
          <p className="text-sm text-white leading-relaxed" style={{ marginBottom: '6px' }}>
            {t('app.description')}
          </p>
          <p className="text-xs text-white" style={{ marginBottom: '30px' }}>
            {t('app.description2')}
          </p>

          {/* CTA 버튼 */}
          <Link
            href="/language"
            className="btn-primary text-sm px-10 py-3"
          >
            {t('button.start')}
            <span className="ml-1.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
