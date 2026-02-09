'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api/client';
import { CareerRecommendation } from '@/types';
import StarsBackground from '@/components/common/StarsBackground';
import { useLanguage } from '@/contexts/LanguageContext';

// 3D 컴포넌트는 SSR 불가이므로 dynamic import
const Universe3D = dynamic(() => import('@/components/universe/Universe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#050816' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#0064FF]/30 border-t-[#0064FF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs" style={{ color: '#F5EFFF' }}>3D 우주 로딩 중...</p>
      </div>
    </div>
  ),
});

export default function UniversePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const profileId = searchParams.get('profileId');
  const selectedIds = searchParams.get('selected')?.split(',') || [];

  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [selectedCareers, setSelectedCareers] = useState<Set<string>>(
    new Set(selectedIds)
  );
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);
  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    if (!profileId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 추천 데이터와 유저 정보 동시 로드
        const [recResponse, userResponse] = await Promise.all([
          apiClient.getRecommendations(profileId),
          apiClient.getCurrentUser().catch(() => null),
        ]);
        setRecommendations(recResponse.recommendations);
        if (userResponse) {
          setNickname(userResponse.nickname);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

  const handleCareerClick = (careerId: string) => {
    const career = recommendations.find((r) => r.recommendation_id === careerId);
    if (career) {
      setSelectedCareer((prev) =>
        prev?.recommendation_id === careerId ? null : career
      );
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
        <StarsBackground />
        <div className="relative z-10 w-full mx-auto px-5" style={{ maxWidth: '480px' }}>
          <div className="glass-hero rounded-3xl px-6 py-10 shadow-2xl text-center">
            <div className="w-10 h-10 border-2 border-[#0064FF]/30 border-t-[#0064FF] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm" style={{ color: '#F5EFFF' }}>{t('universe.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden flex flex-col" style={{ background: '#050816' }}>
      {/* 3D 캔버스 (전체 화면 배경) */}
      <div className="absolute inset-0 z-0">
        <Universe3D
          recommendations={recommendations}
          selectedCareerIds={Array.from(selectedCareers)}
          onCareerClick={handleCareerClick}
          nickname={nickname}
        />
      </div>

      {/* 상단 오버레이 헤더 */}
      <header className="relative z-10 glass px-5 py-3 shrink-0">
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: '480px' }}>
          <div>
            <h1 className="text-base font-semibold mb-0.5" style={{ color: '#F5EFFF' }}>
              {t('universe.title')}
            </h1>
            <p className="text-xs" style={{ color: '#F5EFFF' }}>{t('universe.description')}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-white hover:text-white/80 transition-colors text-xs px-3 py-1.5 glass rounded-full"
          >
            {t('button.back')}
          </button>
        </div>
      </header>

      {/* 우측 하단 안내 */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="glass rounded-xl px-3 py-2 text-xs" style={{ color: '#F5EFFF' }}>
          🖱️ {t('universe.controls') || '드래그: 회전 | 스크롤: 줌 | 행성 클릭: 상세'}
        </div>
      </div>

      {/* 선택된 진로 정보 오버레이 패널 */}
      {selectedCareer && (
        <div className="absolute inset-x-0 bottom-4 z-20 px-4">
          <div className="mx-auto" style={{ maxWidth: '480px' }}>
            <div
              className="glass-hero rounded-2xl px-5 py-5 shadow-2xl relative"
              style={{ backdropFilter: 'blur(40px)' }}
            >
              <button
                onClick={() => setSelectedCareer(null)}
                className="absolute top-3 right-3 text-white hover:text-white/80 transition-colors text-xs w-6 h-6 flex items-center justify-center rounded-full glass"
              >
                ✕
              </button>

              {/* 커스텀 태그 */}
              {selectedCareer.is_custom && (
                <span
                  className="inline-block px-2 py-0.5 text-[10px] font-semibold text-yellow-300 rounded-full mb-2"
                  style={{ background: 'rgba(251, 188, 4, 0.15)' }}
                >
                  ✨ {t('career.custom')}
                </span>
              )}

              <h2 className="text-base font-bold mb-1 pr-6" style={{ color: '#F5EFFF' }}>
                {selectedCareer.career_name}
              </h2>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: '#F5EFFF' }}>
                {selectedCareer.description}
              </p>

              <div className="space-y-3">
                {/* 추천 이유 */}
                <div>
                  <h3 className="text-xs font-semibold mb-0.5" style={{ color: '#F5EFFF' }}>
                    {t('career.why')}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#F5EFFF' }}>
                    {selectedCareer.match_reason}
                  </p>
                </div>

                {/* 필요 스킬 */}
                <div>
                  <h3 className="text-xs font-semibold mb-1" style={{ color: '#F5EFFF' }}>
                    {t('career.skills')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCareer.skills_needed.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-[10px] rounded-full"
                        style={{ color: '#F5EFFF', background: 'rgba(0, 100, 255, 0.2)' }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 관련 직업 */}
                <div>
                  <h3 className="text-xs font-semibold mb-1" style={{ color: '#F5EFFF' }}>
                    {t('career.jobs')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCareer.example_jobs.map((job, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-[10px] rounded-full"
                        style={{ color: '#F5EFFF', background: 'rgba(255, 255, 255, 0.06)' }}
                      >
                        {job}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 교육/전망 */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold mb-0.5" style={{ color: '#F5EFFF' }}>
                      {t('career.education')}
                    </h3>
                    <p className="text-[10px] leading-relaxed" style={{ color: '#F5EFFF' }}>
                      {selectedCareer.education_path}
                    </p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold mb-0.5" style={{ color: '#F5EFFF' }}>
                      {t('career.growth')}
                    </h3>
                    <p className="text-[10px] leading-relaxed" style={{ color: '#F5EFFF' }}>
                      {selectedCareer.growth_potential}
                    </p>
                  </div>
                </div>
              </div>

              {/* 비전 보드 버튼 */}
              <button
                onClick={() =>
                  router.push(
                    `/vision-board?recommendationId=${selectedCareer.recommendation_id}&careerName=${encodeURIComponent(selectedCareer.career_name)}`
                  )
                }
                className="btn-primary w-full mt-4 text-xs py-2.5"
              >
                🌟 {t('universe.visionBoard') || '미래의 나 만들기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
