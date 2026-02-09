'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import StarsBackground from '@/components/common/StarsBackground';
import { useLanguage } from '@/contexts/LanguageContext';

type VisionStyle = 'id_badge' | 'magazine_cover' | 'achievement';

interface VisionData {
  title: string;
  year: string;
  role: string;
  company: string;
  description: string;
  achievements: string[];
  quote: string;
  milestones: Array<{ year: string; event: string }>;
  daily_life: string;
}

export default function VisionBoardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const recommendationId = searchParams.get('recommendationId');
  const careerName = searchParams.get('careerName') || '';

  const [style, setStyle] = useState<VisionStyle>('magazine_cover');
  const [loading, setLoading] = useState(false);
  const [visionData, setVisionData] = useState<VisionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styles: { value: VisionStyle; label: string; icon: string }[] = [
    { value: 'id_badge', label: t('visionBoard.style.id_badge'), icon: '🪪' },
    { value: 'magazine_cover', label: t('visionBoard.style.magazine_cover'), icon: '📰' },
    { value: 'achievement', label: t('visionBoard.style.achievement'), icon: '🏆' },
  ];

  const handleGenerate = async () => {
    if (!recommendationId) return;

    setLoading(true);
    setError(null);
    setVisionData(null);

    try {
      const response = await apiClient.generateVisionBoard(recommendationId, style);
      setVisionData(response.vision_data);
    } catch (err: any) {
      setError(err.message || t('visionBoard.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setVisionData(null);
    setError(null);
  };

  // 비전 데이터 결과 화면
  if (visionData) {
    return (
      <div className="relative min-h-screen deep-space overflow-hidden">
        <StarsBackground />
        <div className="relative z-10 w-full mx-auto px-5 py-6 pb-24" style={{ maxWidth: '480px' }}>
          {/* 헤더 */}
          <div className="text-center mb-6">
            <span className="text-3xl mb-2 block">✨</span>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#F5EFFF' }}>{t('visionBoard.result')}</h1>
            <p className="text-xs" style={{ color: '#F5EFFF' }}>{careerName}</p>
          </div>

          {/* 비전 보드 이미지 형식 카드 */}
          <div 
            className="rounded-3xl overflow-hidden shadow-2xl mb-6 relative"
            style={{
              aspectRatio: style === 'id_badge' ? '2/3' : '3/4',
              background:
                style === 'id_badge'
                  ? 'linear-gradient(135deg, #1a365d 0%, #2563eb 50%, #1e40af 100%)'
                  : style === 'magazine_cover'
                  ? 'linear-gradient(135deg, #831843 0%, #ec4899 50%, #be185d 100%)'
                  : 'linear-gradient(135deg, #713f12 0%, #f59e0b 50%, #d97706 100%)',
              position: 'relative',
              minHeight: '600px',
            }}
          >
            {/* 배경 패턴 효과 */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              }}
            />
            
            {/* 메인 콘텐츠 */}
            <div className="relative z-10 h-full flex flex-col p-6">
              {/* 상단 헤더 */}
              <div className="text-center mb-6">
                <p className="text-sm mb-2 font-semibold" style={{ color: '#F5EFFF', opacity: 0.9 }}>{visionData.year}</p>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#F5EFFF', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                  {visionData.title}
                </h2>
                <p className="text-base font-medium" style={{ color: '#F5EFFF', opacity: 0.95 }}>
                  {visionData.role}
                </p>
                <p className="text-sm mt-1" style={{ color: '#F5EFFF', opacity: 0.85 }}>
                  @ {visionData.company}
                </p>
              </div>

              {/* 중앙 설명 */}
              <div className="flex-1 flex flex-col justify-center mb-4">
                <p className="text-sm leading-relaxed text-center mb-4" style={{ color: '#F5EFFF', opacity: 0.95 }}>
                  {visionData.description}
                </p>

                {/* 인용구 - 강조 */}
                <div
                  className="text-center px-4 py-4 rounded-xl mb-4"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <p className="text-base italic leading-relaxed font-medium" style={{ color: '#F5EFFF' }}>
                    &ldquo;{visionData.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* 하단 정보 섹션 */}
              <div className="space-y-3 mt-auto">
                {/* 성과 - 컴팩트하게 */}
                <div>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: '#F5EFFF', opacity: 0.9 }}>🏅 주요 성과</h3>
                  <div className="space-y-1">
                    {visionData.achievements.slice(0, 3).map((achievement, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: '#F5EFFF', opacity: 0.9 }}
                      >
                        <span className="text-white font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 마일스톤 - 간단하게 */}
                <div>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: '#F5EFFF', opacity: 0.9 }}>📍 성장 타임라인</h3>
                  <div className="flex flex-wrap gap-2">
                    {visionData.milestones.slice(0, 3).map((milestone, i) => (
                      <div 
                        key={i} 
                        className="px-2 py-1 rounded-lg"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <p className="text-[10px] font-semibold" style={{ color: '#F5EFFF' }}>
                          {milestone.year}
                        </p>
                        <p className="text-[10px] leading-tight" style={{ color: '#F5EFFF', opacity: 0.85 }}>
                          {milestone.event.length > 20 ? milestone.event.substring(0, 20) + '...' : milestone.event}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="btn-primary w-full text-sm py-3"
            >
              🔄 {t('visionBoard.retry')}
            </button>
            <button
              onClick={() => {
                setVisionData(null);
                setStyle(
                  style === 'id_badge'
                    ? 'magazine_cover'
                    : style === 'magazine_cover'
                    ? 'achievement'
                    : 'id_badge'
                );
              }}
              className="w-full text-sm py-3 transition-colors"
              style={{ color: '#F5EFFF' }}
            >
              {t('visionBoard.otherStyle')}
            </button>
            <button
              onClick={() => router.back()}
              className="w-full text-sm py-2 transition-colors"
              style={{ color: '#F5EFFF' }}
            >
              ← {t('button.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 생성 폼 화면
  return (
    <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
      <StarsBackground />
      <div className="relative z-10 w-full mx-auto px-5 py-8" style={{ maxWidth: '480px' }}>
        <div className="glass-hero rounded-3xl px-6 py-8 shadow-2xl">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <span className="text-3xl mb-2 block">🌟</span>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#F5EFFF' }}>{t('visionBoard.title')}</h1>
            <p className="text-xs mb-2" style={{ color: '#F5EFFF' }}>{t('visionBoard.subtitle')}</p>
            {careerName && (
              <div
                className="inline-block px-3 py-1 rounded-full text-xs"
                style={{ background: 'rgba(0, 100, 255, 0.15)', color: '#F5EFFF' }}
              >
                {careerName}
              </div>
            )}
          </div>

          {/* 에러 표시 */}
          {error && (
            <div
              className="text-sm mb-4"
              style={{
                color: '#F5EFFF',
                background: 'rgba(255, 59, 48, 0.15)',
                padding: '10px 14px',
                borderRadius: '12px',
              }}
            >
              {error}
            </div>
          )}

          {/* 스타일 선택 */}
          <div className="mb-6">
            <label className="text-xs font-medium block mb-3" style={{ color: '#F5EFFF' }}>
              {t('visionBoard.style')}
            </label>
            <div className="space-y-2">
              {styles.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    style === s.value
                      ? 'glass-strong border-[#007AFF]/30'
                      : 'glass hover:bg-white/5'
                  }`}
                  style={
                    style === s.value
                      ? { borderColor: 'rgba(0, 122, 255, 0.3)' }
                      : {}
                  }
                >
                  <span className="text-xl">{s.icon}</span>
                  <span
                    className={`text-sm ${
                      style === s.value ? 'font-semibold' : ''
                    }`}
                    style={{ color: '#F5EFFF' }}
                  >
                    {s.label}
                  </span>
                  {style === s.value && (
                    <span className="ml-auto text-[#007AFF] text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={loading || !recommendationId}
            className="btn-primary w-full py-3 text-sm disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('visionBoard.generating')}
              </span>
            ) : (
              <>🚀 {t('visionBoard.generate')}</>
            )}
          </button>

          {/* 뒤로가기 */}
          <button
            onClick={() => router.back()}
            className="w-full mt-3 text-sm py-2 transition-colors"
            style={{ color: '#F5EFFF' }}
          >
            ← {t('button.back')}
          </button>
        </div>
      </div>
    </div>
  );
}

