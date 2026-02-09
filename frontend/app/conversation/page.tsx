'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import { apiClient } from '@/lib/api/client';
import StarsBackground from '@/components/common/StarsBackground';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ConversationPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [initialMessages, setInitialMessages] = useState<Array<{
    message_id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    const startConversation = async () => {
      try {
        setLoading(true);
        const response = await apiClient.startConversation();
        setSessionId(response.session_id);
        
        if (response.first_message) {
          setInitialMessages([
            {
              message_id: `initial-${Date.now()}`,
              role: response.first_message.role as 'assistant',
              content: response.first_message.content,
              timestamp: response.first_message.timestamp,
            },
          ]);
        }
      } catch (err: any) {
        setError(err.message || t('conversation.error.start'));
      } finally {
        setLoading(false);
      }
    };

    startConversation();
  }, [t]);

  const handleComplete = async () => {
    if (!sessionId) return;

    try {
      // 세션 확인 및 분석
      const analysis = await apiClient.analyzeConversation(sessionId);
      const profileId = analysis.profile_id;
      
      // localStorage에 profileId 저장 (세션 만료되어도 결과 확인 가능)
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastProfileId', profileId);
        localStorage.setItem('lastProfileTimestamp', Date.now().toString());
      }
      
      router.push(`/recommendations?profileId=${profileId}`);
    } catch (err: any) {
      console.error('Error analyzing conversation:', err);
      // 세션 만료 에러인 경우
      if (err.message && (err.message.includes('Session not found') || err.message.includes('session not found'))) {
        alert('세션이 만료되었습니다. 대화를 다시 시작해주세요.');
        router.push('/conversation');
      } else {
        alert(t('conversation.error.analyze') || '대화 분석 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen deep-space overflow-hidden flex items-center justify-center">
        <StarsBackground />
        <div className="relative z-10 w-full mx-auto px-5" style={{ maxWidth: '480px' }}>
          <div className="glass-hero shadow-2xl text-center" style={{ padding: '30px', borderRadius: '24px' }}>
            {/* 우주선 날아가는 애니메이션 */}
            <div style={{ height: '80px', position: 'relative', overflow: 'hidden', marginBottom: '15px' }}>
              <div className="rocket-trail" />
              <div className="rocket-fly">
                <span style={{ fontSize: '36px' }}>🚀</span>
              </div>
            </div>
            <p className="text-sm" style={{ marginBottom: '6px', color: '#F5EFFF' }}>
              {t('conversation.loading')}
            </p>
            <div className="loading-dots">
              <span className="dot dot1" />
              <span className="dot dot2" />
              <span className="dot dot3" />
            </div>
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
            <p className="text-sm mb-4" style={{ color: '#F5EFFF' }}>{error}</p>
            <button onClick={() => router.push('/onboarding')} className="btn-primary text-sm px-8 py-2.5">
              {t('conversation.restart')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return null;
  }

  return (
    <div className="relative h-screen deep-space overflow-hidden flex flex-col">
      <StarsBackground />
      {/* 대화 영역 — 최대 1080px, 중앙 정렬 */}
      <div className="relative z-10 flex flex-col h-full w-full mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1080px' }}>
        {/* 헤더 */}
        <header
          className="flex flex-col shrink-0"
          style={{
            background: 'rgba(10, 14, 26, 0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold tracking-tight" style={{ color: '#F5EFFF' }}>
                  {t('conversation.title')}
                </h1>
                <p className="text-xs" style={{ color: '#F5EFFF' }}>{t('conversation.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-white hover:text-white/80 transition-colors text-sm px-4 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {t('button.home')}
            </button>
          </div>
          
          {/* 진행 바 - 광선검 스타일 */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium" style={{ color: '#F5EFFF', minWidth: '60px' }}>
                {Math.round(progress * 100)}%
              </span>
              {/* 배경 박스 제거, 진행 바만 표시 */}
              <div className="flex-1 h-3 relative">
                {/* 광선검처럼 글로우 효과가 있는 진행 바 */}
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out relative"
                  style={{
                    width: `${progress * 100}%`,
                    background: progress >= 0.8
                      ? 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)'
                      : progress >= 0.6
                      ? 'linear-gradient(90deg, #4CAF50, #8BC34A, #4CAF50)'
                      : progress >= 0.4
                      ? 'linear-gradient(90deg, #2196F3, #03A9F4, #2196F3)'
                      : 'linear-gradient(90deg, #9C27B0, #E91E63, #9C27B0)',
                    boxShadow: progress >= 0.8
                      ? '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.3)'
                      : progress >= 0.6
                      ? '0 0 20px rgba(76, 175, 80, 0.8), 0 0 40px rgba(139, 195, 74, 0.6), 0 0 60px rgba(76, 175, 80, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.3)'
                      : progress >= 0.4
                      ? '0 0 20px rgba(33, 150, 243, 0.8), 0 0 40px rgba(3, 169, 244, 0.6), 0 0 60px rgba(33, 150, 243, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.3)'
                      : '0 0 20px rgba(156, 39, 176, 0.8), 0 0 40px rgba(233, 30, 99, 0.6), 0 0 60px rgba(156, 39, 176, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.3)',
                    filter: 'blur(0.5px)',
                  }}
                >
                  {/* 내부 하이라이트 효과 */}
                  <div
                    className="absolute top-0 left-0 right-0 h-full rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                      mixBlendMode: 'overlay',
                    }}
                  />
                </div>
              </div>
              <span className="text-xs" style={{ color: '#F5EFFF', opacity: 0.7 }}>
                {progress >= 0.8 ? '🌟' : progress >= 0.6 ? '🚀' : progress >= 0.4 ? '💫' : progress >= 0.2 ? '⭐' : '🌱'}
              </span>
            </div>
            <p className="text-xs text-center" style={{ color: '#F5EFFF', opacity: 0.8 }}>
              {progress >= 0.8
                ? t('conversation.progress.almost')
                : progress >= 0.6
                ? t('conversation.progress.good')
                : progress >= 0.4
                ? t('conversation.progress.half')
                : progress >= 0.2
                ? t('conversation.progress.starting')
                : t('conversation.progress.start')}
            </p>
          </div>
        </header>

        {/* 채팅 영역 */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            sessionId={sessionId}
            initialMessages={initialMessages}
            onProgressUpdate={setProgress}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
}
