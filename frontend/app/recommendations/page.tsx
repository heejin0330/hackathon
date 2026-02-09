'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CareerCard from '@/components/career/CareerCard';
import { apiClient } from '@/lib/api/client';
import { CareerRecommendation } from '@/types';
import StarsBackground from '@/components/common/StarsBackground';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const profileId = searchParams.get('profileId');

  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [selectedCareers, setSelectedCareers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customCareerName, setCustomCareerName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setError(t('recommendations.error.profile'));
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getRecommendations(profileId);
        setRecommendations(response.recommendations);
      } catch (err: any) {
        setError(err.message || t('recommendations.error.load'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [profileId, t]);

  const handleSelectCareer = (recommendationId: string) => {
    setSelectedCareers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recommendationId)) {
        newSet.delete(recommendationId);
      } else {
        newSet.add(recommendationId);
      }
      return newSet;
    });
  };

  const handleAddCustomCareer = async () => {
    if (!customCareerName.trim() || !profileId) return;

    try {
      setAddingCustom(true);
      const response = await apiClient.addCustomCareer(profileId, customCareerName.trim());
      setRecommendations((prev) => [...prev, response]);
      setCustomCareerName('');
      setShowCustomForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add custom career');
    } finally {
      setAddingCustom(false);
    }
  };

  const handleContinue = () => {
    if (selectedCareers.size === 0) {
      alert(t('recommendations.error.select'));
      return;
    }
    router.push(`/universe?profileId=${profileId}&selected=${Array.from(selectedCareers).join(',')}`);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
        <StarsBackground />
        <div className="relative z-10 w-full mx-auto px-5" style={{ maxWidth: '480px' }}>
          <div className="glass-hero rounded-3xl px-6 py-10 shadow-2xl text-center">
            <div className="w-10 h-10 border-2 border-[#0064FF]/30 border-t-[#0064FF] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-sm">{t('recommendations.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
        <StarsBackground />
        <div className="relative z-10 w-full mx-auto px-5" style={{ maxWidth: '480px' }}>
          <div className="glass-hero rounded-3xl px-6 py-8 shadow-2xl text-center">
            <p className="text-white text-sm mb-4">{error}</p>
            <button onClick={() => router.push('/')} className="btn-primary text-sm px-8 py-2.5">
              {t('button.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen deep-space overflow-hidden">
      <StarsBackground />
      {/* 모바일 앱 느낌의 고정 너비 컨테이너 */}
      <div className="relative z-10 w-full mx-auto px-5 py-6 pb-24" style={{ maxWidth: '480px' }}>
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            {t('recommendations.title')}
          </h1>
          <p className="text-xs text-white">
            {t('recommendations.subtitle', { count: recommendations.length })}
          </p>
        </div>

        {/* 1열 카드 리스트 */}
        <div className="flex flex-col gap-4 mb-6">
          {recommendations.map((recommendation) => (
            <CareerCard
              key={recommendation.recommendation_id}
              recommendation={recommendation}
              onSelect={handleSelectCareer}
              selected={selectedCareers.has(recommendation.recommendation_id)}
            />
          ))}
        </div>

        {/* 커스텀 진로 추가 */}
        <div className="glass-hero rounded-2xl px-5 py-5 shadow-2xl mb-6">
          <h2 className="text-sm font-semibold text-white mb-1">
            💡 {t('recommendations.custom.title')}
          </h2>
          <p className="text-xs text-white mb-4">
            {t('recommendations.custom.description')}
          </p>

          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="btn-primary text-xs px-5 py-2"
            >
              + {t('recommendations.custom.add')}
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={customCareerName}
                onChange={(e) => setCustomCareerName(e.target.value)}
                placeholder={t('recommendations.custom.placeholder')}
                className="input-field text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddCustomCareer();
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustomCareer}
                  disabled={!customCareerName.trim() || addingCustom}
                  className="btn-primary text-xs px-5 py-2 disabled:opacity-40"
                >
                  {addingCustom ? t('recommendations.custom.adding') : t('button.add')}
                </button>
                <button
                  onClick={() => { setShowCustomForm(false); setCustomCareerName(''); }}
                  className="text-xs text-white hover:text-white/80 transition-colors px-3 py-2"
                >
                  {t('button.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 바 */}
      {selectedCareers.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="w-full mx-auto px-5 pb-5" style={{ maxWidth: '480px' }}>
            <div className="glass-hero rounded-2xl px-5 py-3 shadow-2xl flex items-center justify-between">
              <p className="text-xs text-white">
                <span className="font-semibold text-white">{selectedCareers.size}</span>
                {' '}{t('recommendations.selected', { count: selectedCareers.size })}
              </p>
              <button onClick={handleContinue} className="btn-primary text-xs px-5 py-2">
                {t('recommendations.view')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
