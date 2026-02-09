'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import StarsBackground from '@/components/common/StarsBackground';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nickname: '',
    age: 15,
    language: language,
    country: '',
    preferredInputMethod: 'text' as 'text' | 'voice' | 'mixed',
    grade: '',
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, language }));
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.nickname.trim()) {
        setError(t('onboarding.error.nickname'));
        setLoading(false);
        return;
      }

      if (formData.age < 10 || formData.age > 17) {
        setError(t('onboarding.error.age'));
        setLoading(false);
        return;
      }

      if (!formData.language) {
        setError('언어를 선택해주세요');
        setLoading(false);
        return;
      }

      const response = await apiClient.createUser({
        nickname: formData.nickname.trim(),
        age: formData.age,
        language: formData.language,
        country: formData.country || undefined,
        preferredInputMethod: formData.preferredInputMethod,
      });

      router.push('/conversation');
    } catch (err: any) {
      setError(err.message || t('onboarding.error.create'));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
      <StarsBackground />
      <div className="relative z-10 w-full mx-auto px-5 py-8" style={{ maxWidth: '480px' }}>
        {/* 외부 글라스 박스: 패딩 30px, 둥근 모서리 */}
        <div className="glass-hero shadow-2xl" style={{ padding: '30px', borderRadius: '24px' }}>
          {/* 타이틀 영역 */}
          <div className="text-center" style={{ marginBottom: '15px' }}>
            <h1 className="text-2xl font-bold tracking-tight" style={{ marginBottom: '4px', color: '#F5EFFF' }}>
              {t('onboarding.subtitle')}
            </h1>
            <p className="text-xs" style={{ marginBottom: '8px', color: '#F5EFFF' }}>
              {t('onboarding.title')}
            </p>
            <p className="text-sm" style={{ color: '#F5EFFF' }}>
              {t('onboarding.question')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div
                className="text-sm"
                style={{
                  color: '#F5EFFF',
                  background: 'rgba(255, 59, 48, 0.15)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  marginBottom: '15px',
                }}
              >
                {error}
              </div>
            )}

            {/* 닉네임 - 필수 */}
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="nickname" className="text-xs font-medium" style={{ display: 'block', marginBottom: '6px', color: '#F5EFFF' }}>
                {t('onboarding.nickname')} *
              </label>
              <input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="input-field"
                placeholder={t('onboarding.nickname.placeholder')}
                required
              />
            </div>

            {/* 나이 - 필수 */}
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="age" className="text-xs font-medium" style={{ display: 'block', marginBottom: '6px', color: '#F5EFFF' }}>
                {t('onboarding.age.range')}
              </label>
              <input
                id="age"
                type="number"
                min="10"
                max="17"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 15 })}
                className="input-field"
                required
              />
            </div>

            {/* 학년 - 필수 아님 */}
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="grade" className="text-xs font-medium" style={{ display: 'block', marginBottom: '6px', color: '#F5EFFF' }}>
                {t('onboarding.grade')}
              </label>
              <input
                id="grade"
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="input-field"
                placeholder={t('onboarding.grade.placeholder')}
              />
            </div>

            {/* 선택 영역 (기본 펼침, 필수 아님) */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
                {/* 거주 지역 */}
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="country" className="text-xs font-medium" style={{ display: 'block', marginBottom: '6px', color: '#F5EFFF' }}>
                    {t('onboarding.country')}
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input-field"
                    placeholder={t('onboarding.country.placeholder')}
                  />
                </div>

                {/* 소통 방식 */}
                <div>
                  <label htmlFor="preferredInputMethod" className="text-xs font-medium" style={{ display: 'block', marginBottom: '6px', color: '#F5EFFF' }}>
                    {t('onboarding.inputMethod')}
                  </label>
                  <select
                    id="preferredInputMethod"
                    value={formData.preferredInputMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredInputMethod: e.target.value as 'text' | 'voice' | 'mixed',
                      })
                    }
                    className="input-field"
                  >
                    <option value="text">{t('onboarding.inputMethod.text')}</option>
                    <option value="voice">{t('onboarding.inputMethod.voice')}</option>
                    <option value="mixed">{t('onboarding.inputMethod.mixed')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 제출 버튼 (마지막 항목 → 아래 margin 없음) */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm"
            >
              {loading ? '...' : t('button.start')}
              {!loading && <span className="ml-1.5">→</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
