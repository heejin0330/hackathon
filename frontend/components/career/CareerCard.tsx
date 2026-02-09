'use client';

import { useState } from 'react';
import { CareerRecommendation } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface CareerCardProps {
  recommendation: CareerRecommendation;
  onSelect?: (recommendationId: string) => void;
  selected?: boolean;
}

export default function CareerCard({
  recommendation,
  onSelect,
  selected = false,
}: CareerCardProps) {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  // Vision Board 스타일 선택 (진로별로 다른 스타일)
  const getVisionStyle = () => {
    const index = parseInt(recommendation.recommendation_id.split('_').pop() || '0', 36) % 3;
    return index === 0 ? 'magazine_cover' : index === 1 ? 'id_badge' : 'achievement';
  };

  const visionStyle = getVisionStyle();
  const gradientColors = {
    id_badge: 'linear-gradient(135deg, #1a365d 0%, #2563eb 50%, #1e40af 100%)',
    magazine_cover: 'linear-gradient(135deg, #831843 0%, #ec4899 50%, #be185d 100%)',
    achievement: 'linear-gradient(135deg, #713f12 0%, #f59e0b 50%, #d97706 100%)',
  };

  return (
    <div
      className={`rounded-3xl overflow-hidden shadow-2xl transition-all relative ${
        selected ? 'ring-2 ring-[#007AFF] shadow-[0_0_40px_rgba(0,122,255,0.4)]' : ''
      }`}
      style={{
        aspectRatio: visionStyle === 'id_badge' ? '2/3' : '3/4',
        background: gradientColors[visionStyle],
        minHeight: '500px',
        marginBottom: '24px',
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
        <div className="text-center mb-4">
          <p className="text-xs mb-2 font-semibold" style={{ color: '#F5EFFF', opacity: 0.9 }}>2040</p>
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#F5EFFF', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {recommendation.career_name}
          </h3>
          {recommendation.is_custom && (
            <span
              className="inline-block px-2 py-1 text-xs rounded-full mb-2"
              style={{
                background: 'rgba(255, 193, 7, 0.3)',
                color: '#FFD700',
                border: '1px solid rgba(255, 193, 7, 0.5)',
              }}
            >
              {t('career.custom')}
            </span>
          )}
          {recommendation.example_jobs[0] && (
            <p className="text-sm mt-1" style={{ color: '#F5EFFF', opacity: 0.85 }}>
              {recommendation.example_jobs[0]}
            </p>
          )}
        </div>

        {/* 중앙 설명 */}
        <div className="flex-1 flex flex-col justify-center mb-4">
          <p className="text-sm leading-relaxed text-center mb-3" style={{ color: '#F5EFFF', opacity: 0.95 }}>
            {recommendation.description}
          </p>

          {/* 추천 이유 - 인용구 형식 */}
          <div
            className="text-center px-4 py-3 rounded-xl mb-3"
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <p className="text-xs italic leading-relaxed font-medium" style={{ color: '#F5EFFF' }}>
              &ldquo;{recommendation.match_reason.substring(0, 80)}{recommendation.match_reason.length > 80 ? '...' : ''}&rdquo;
            </p>
          </div>
        </div>

        {/* 하단 정보 섹션 */}
        <div className="space-y-2 mt-auto">
          {/* 스킬 - 컴팩트하게 */}
          {recommendation.skills_needed.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold mb-1" style={{ color: '#F5EFFF', opacity: 0.9 }}>
                {t('career.skills') || '필요한 스킬'}
              </h4>
              <div className="flex flex-wrap gap-1">
                {recommendation.skills_needed.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-[10px] rounded-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#F5EFFF',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {skill.length > 8 ? skill.substring(0, 8) + '...' : skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#F5EFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {showDetails ? t('career.hide') : t('career.details')}
            </button>
            {onSelect && (
              <button
                onClick={() => onSelect(recommendation.recommendation_id)}
                className={`flex-1 px-3 py-2 rounded-lg transition-all text-xs font-semibold ${
                  selected ? 'btn-primary' : ''
                }`}
                style={
                  !selected
                    ? {
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: '#F5EFFF',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }
                    : {}
                }
              >
                {selected ? `✓ ${t('button.selected')}` : t('button.select')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div
          className="pt-5 border-t space-y-5"
          style={{
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            gap: '20px',
          }}
        >
          {/* 직업 예시 */}
          <div>
            <h4 className="font-semibold mb-3 text-sm" style={{ color: '#F5EFFF', marginBottom: '12px' }}>
              {t('career.jobs')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.example_jobs.map((job, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-xs rounded-full"
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#F5EFFF',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                >
                  {job}
                </span>
              ))}
            </div>
          </div>

          {/* 교육 경로 */}
          <div>
            <h4 className="font-semibold mb-2 text-sm" style={{ color: '#F5EFFF', marginBottom: '8px' }}>
              {t('career.education')}
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: '#F5EFFF', opacity: 0.85 }}>
              {recommendation.education_path}
            </p>
          </div>

          {/* 성장 잠재력 */}
          <div>
            <h4 className="font-semibold mb-2 text-sm" style={{ color: '#F5EFFF', marginBottom: '8px' }}>
              {t('career.growth')}
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: '#F5EFFF', opacity: 0.85 }}>
              {recommendation.growth_potential}
            </p>
          </div>

          {/* 능력별 필요한 스킬 상세 설명 */}
          {recommendation.skills_needed && recommendation.skills_needed.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-sm" style={{ color: '#F5EFFF', marginBottom: '12px' }}>
                능력별 필요한 스킬
              </h4>
              <div className="space-y-3" style={{ gap: '12px' }}>
                {recommendation.skills_needed.map((skill, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl"
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: '16px' }}>✨</span>
                      <span className="text-xs font-medium" style={{ color: '#F5EFFF' }}>
                        {skill}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#F5EFFF', opacity: 0.8, marginTop: '4px' }}>
                      이 진로에서 {skill} 능력이 중요합니다. 꾸준한 학습과 실습을 통해 발전시켜 나가세요.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
