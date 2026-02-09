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
      const analysis = await apiClient.analyzeConversation(sessionId);
      router.push(`/recommendations?profileId=${analysis.profile_id}`);
    } catch (err: any) {
      console.error('Error analyzing conversation:', err);
      alert(t('conversation.error.analyze'));
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
          className="flex items-center justify-between shrink-0 px-6 py-4"
          style={{
            background: 'rgba(10, 14, 26, 0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
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
