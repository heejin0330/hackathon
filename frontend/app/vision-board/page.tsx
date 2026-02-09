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

          {/* 비전 보드 카드 */}
          <div className="glass-hero rounded-3xl overflow-hidden shadow-2xl mb-6">
            {/* 비전 헤더 */}
            <div
              className="px-5 py-6 text-center"
              style={{
                background:
                  style === 'id_badge'
                    ? 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)'
                    : style === 'magazine_cover'
                    ? 'linear-gradient(135deg, #831843 0%, #ec4899 100%)'
                    : 'linear-gradient(135deg, #713f12 0%, #f59e0b 100%)',
              }}
            >
              <p className="text-xs mb-1" style={{ color: '#F5EFFF' }}>{visionData.year}</p>
              <h2 className="text-lg font-bold mb-1" style={{ color: '#F5EFFF' }}>{visionData.title}</h2>
              <p className="text-sm" style={{ color: '#F5EFFF' }}>
                {visionData.role} @ {visionData.company}
              </p>
            </div>

            {/* 본문 */}
            <div className="px-5 py-5 space-y-5">
              {/* 설명 */}
              <p className="text-sm leading-relaxed" style={{ color: '#F5EFFF' }}>{visionData.description}</p>

              {/* 인용구 */}
              <div
                className="text-center px-4 py-4 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <p className="text-sm italic leading-relaxed" style={{ color: '#F5EFFF' }}>
                  &ldquo;{visionData.quote}&rdquo;
                </p>
              </div>

              {/* 성과 */}
              <div>
                <h3 className="text-xs font-semibold mb-2" style={{ color: '#F5EFFF' }}>🏅 주요 성과</h3>
                <div className="space-y-2">
                  {visionData.achievements.map((achievement, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs"
                      style={{ color: '#F5EFFF' }}
                    >
                      <span className="text-[#007AFF] mt-0.5">•</span>
                      <span className="leading-relaxed">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 마일스톤 타임라인 */}
              <div>
                <h3 className="text-xs font-semibold mb-3" style={{ color: '#F5EFFF' }}>📍 성장 타임라인</h3>
                <div className="relative pl-4 space-y-3">
                  {/* 타임라인 라인 */}
                  <div
                    className="absolute left-[5px] top-1 bottom-1 w-px"
                    style={{ background: 'rgba(0, 100, 255, 0.3)' }}
                  />
                  {visionData.milestones.map((milestone, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                      {/* 타임라인 dot */}
                      <div
                        className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          borderColor: '#007AFF',
                          background: i === visionData.milestones.length - 1
                            ? '#007AFF'
                            : 'rgba(0, 10, 30, 0.8)',
                        }}
                      />
                      <div>
                        <p className="text-[10px] font-semibold text-[#007AFF]">
                          {milestone.year}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: '#F5EFFF' }}>
                          {milestone.event}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 일상 */}
              <div>
                <h3 className="text-xs font-semibold mb-2" style={{ color: '#F5EFFF' }}>☀️ 하루 일과</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#F5EFFF' }}>{visionData.daily_life}</p>
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

