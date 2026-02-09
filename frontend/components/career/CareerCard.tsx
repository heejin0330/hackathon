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

  return (
    <div
      className={`glass-hero rounded-2xl shadow-2xl transition-all ${
        selected ? 'ring-2 ring-[#007AFF] shadow-[0_0_40px_rgba(0,122,255,0.4)]' : ''
      }`}
      style={{
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      {/* 행성 헤더 */}
      <div className="flex items-start justify-between mb-5" style={{ marginBottom: '20px' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: selected
                ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.3), rgba(0, 122, 255, 0.1))'
                : 'rgba(255, 255, 255, 0.1)',
              border: selected
                ? '2px solid rgba(0, 122, 255, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: selected
                ? '0 0 20px rgba(0, 122, 255, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            {selected ? '⭐' : '🪐'}
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ color: '#F5EFFF' }}>
              {recommendation.career_name}
            </h3>
            {recommendation.is_custom && (
              <span
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  background: 'rgba(255, 193, 7, 0.2)',
                  color: '#FFD700',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                }}
              >
                {t('career.custom')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 설명 */}
      <p className="mb-5 text-sm leading-relaxed" style={{ color: '#F5EFFF', opacity: 0.9, marginBottom: '20px' }}>
        {recommendation.description}
      </p>

      {/* 추천 이유 */}
      <div className="mb-5" style={{ marginBottom: '20px' }}>
        <p className="text-sm font-semibold mb-2" style={{ color: '#F5EFFF' }}>
          {t('career.why')}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#F5EFFF', opacity: 0.85 }}>
          {recommendation.match_reason}
        </p>
      </div>

      {/* 필요한 스킬 - 능력별 분류 */}
      <div className="mb-5" style={{ marginBottom: '20px' }}>
        <p className="text-sm font-semibold mb-3" style={{ color: '#F5EFFF' }}>
          {t('career.skills') || '필요한 스킬'}
        </p>
        <div className="space-y-3" style={{ gap: '12px' }}>
          {/* 스킬을 능력별로 그룹화하여 표시 */}
          {recommendation.skills_needed.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recommendation.skills_needed.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-xs rounded-full"
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#F5EFFF',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#F5EFFF', opacity: 0.7 }}>
              스킬 정보가 없습니다
            </p>
          )}
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-3 mb-4" style={{ gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#F5EFFF',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {showDetails ? t('career.hide') : t('career.details')}
        </button>
        {onSelect && (
          <button
            onClick={() => onSelect(recommendation.recommendation_id)}
            className={`flex-1 px-4 py-2.5 rounded-full transition-all text-sm font-semibold ${
              selected
                ? 'btn-primary'
                : ''
            }`}
            style={
              !selected
                ? {
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#F5EFFF',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }
                : {}
            }
          >
            {selected ? `✓ ${t('button.selected')}` : t('button.select')}
          </button>
        )}
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
