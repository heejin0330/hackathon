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
      className={`glass-card shadow-2xl ${
        selected ? 'ring-2 ring-[#007AFF] shadow-[0_0_40px_rgba(0,122,255,0.4)]' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="futuristic-title text-2xl text-white">{recommendation.career_name}</h3>
        {recommendation.is_custom && (
          <span className="px-3 py-1 glass bg-yellow-400/20 text-yellow-200 text-xs rounded-full shadow-lg">
            {t('career.custom')}
          </span>
        )}
      </div>

      <p className="text-white mb-4">{recommendation.description}</p>

      <div className="mb-4">
        <p className="text-sm text-white mb-2">{t('career.why')}</p>
        <p className="text-white text-sm">{recommendation.match_reason}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {recommendation.skills_needed.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 glass bg-[#007AFF]/20 text-white text-xs rounded-full shadow-lg"
          >
            {skill}
          </span>
        ))}
        {recommendation.skills_needed.length > 3 && (
          <span className="px-3 py-1 glass bg-white/5 text-white text-xs rounded-full shadow-lg">
            +{recommendation.skills_needed.length - 3}
          </span>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 px-4 py-2 rounded-full glass text-white hover:text-white/80 transition-all text-sm shadow-lg"
        >
          {showDetails ? t('career.hide') : t('career.details')}
        </button>
        {onSelect && (
          <button
            onClick={() => onSelect(recommendation.recommendation_id)}
            className={`flex-1 px-4 py-2 rounded-full transition-all text-sm font-semibold shadow-lg ${
              selected
                ? 'btn-primary'
                : 'glass text-white hover:text-white/80 hover:bg-white/10'
            }`}
          >
            {selected ? `✓ ${t('button.selected')}` : t('button.select')}
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div>
            <h4 className="font-semibold text-white mb-2">{t('career.jobs')}</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.example_jobs.map((job, index) => (
                <span
                  key={index}
                  className="px-3 py-1 glass bg-[#007AFF]/20 text-white text-xs rounded-full shadow-lg"
                >
                  {job}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">{t('career.education')}</h4>
            <p className="text-sm text-white">{recommendation.education_path}</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">{t('career.growth')}</h4>
            <p className="text-sm text-white">{recommendation.growth_potential}</p>
          </div>
        </div>
      )}
    </div>
  );
}
