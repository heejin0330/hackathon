'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConversationMessage } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages?: ConversationMessage[];
  onProgressUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export default function ChatInterface({
  sessionId,
  initialMessages = [],
  onProgressUpdate,
  onComplete,
}: ChatInterfaceProps) {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 음성 인식 훅
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSTTSupported,
  } = useSpeechRecognition(language);

  // 음성 합성 훅
  const {
    speak,
    cancel: cancelSpeak,
    isSpeaking,
    isSupported: isTTSSupported,
  } = useSpeechSynthesis(language);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // 음성 인식 결과를 입력 필드에 반영
  useEffect(() => {
    if (transcript) {
      setInput((prev) => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMessage: ConversationMessage = {
      message_id: `temp-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      input_method: messageText ? 'voice' : 'text',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { apiClient } = await import('@/lib/api/client');
      const response = await apiClient.sendMessage(
        sessionId,
        userMessage.content,
        userMessage.input_method || 'text'
      );

      const aiMessage: ConversationMessage = {
        message_id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.ai_response.content,
        timestamp: response.ai_response.timestamp,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setProgress(response.progress);
      onProgressUpdate?.(response.progress);

      // 자동 음성 출력이 켜져 있으면 AI 응답을 읽어줌
      if (autoSpeak && isTTSSupported) {
        speak(response.ai_response.content);
      }

      // 대화 완료 체크
      if (response.progress >= 1.0) {
        onComplete?.();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((msg) => msg.message_id !== userMessage.message_id));
      alert(error.message || '메시지 전송에 실패했습니다');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, sessionId, onProgressUpdate, onComplete, autoSpeak, isTTSSupported, speak]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeak(); // TTS 중이면 중지
      startListening();
    }
  };

  const handleSpeakMessage = (text: string) => {
    if (isSpeaking) {
      cancelSpeak();
    } else {
      speak(text);
    }
  };

  // 진행률에 따른 격려 이모지
  const getProgressEmoji = () => {
    if (progress >= 0.8) return '🌟';
    if (progress >= 0.6) return '🚀';
    if (progress >= 0.4) return '💫';
    if (progress >= 0.2) return '⭐';
    return '🌱';
  };

  const getProgressLabel = () => {
    if (progress >= 0.8) return '거의 다 왔어요!';
    if (progress >= 0.6) return '잘하고 있어요!';
    if (progress >= 0.4) return '절반 넘었어요!';
    if (progress >= 0.2) return '좋은 출발이에요!';
    return '대화를 시작해볼까요?';
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Messages Area ── */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex flex-col max-w-full" style={{ gap: '15px' }}>
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.message_id}
                className={`flex items-end gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* 아바타 — 48px 원형 */}
                <div
                  className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: isUser
                      ? 'rgba(0, 122, 255, 0.15)'
                      : 'rgba(88, 86, 214, 0.15)',
                    border: `1.5px solid ${isUser ? 'rgba(0,122,255,0.30)' : 'rgba(88,86,214,0.30)'}`,
                  }}
                >
                  {isUser ? '🧑‍🚀' : '🤖'}
                </div>

                {/* 말풍선 */}
                <div
                  className="group relative"
                  style={{
                    maxWidth: 'min(70%, 600px)',
                    minWidth: '80px',
                  }}
                >
                  {/* 발신자 라벨 */}
                  <p
                    className={`text-xs mb-1.5 font-medium ${isUser ? 'text-right' : 'text-left'}`}
                    style={{ color: '#FFFFFF' }}
                  >
                    {isUser ? '나 🚀' : '패스파인더 🌌'}
                  </p>

                  <div
                    className="relative"
                    style={{
                      borderRadius: '20px',
                      padding: '16px 24px',
                      background: isUser
                        ? 'rgba(0, 122, 255, 0.18)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${
                        isUser
                          ? 'rgba(0, 122, 255, 0.25)'
                          : 'rgba(255, 255, 255, 0.10)'
                      }`,
                      backdropFilter: 'blur(16px)',
                      boxShadow: isUser
                        ? '0 8px 24px rgba(0, 122, 255, 0.1)'
                        : '0 8px 24px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {/* 음성 입력 배지 */}
                    {message.input_method === 'voice' && isUser && (
                      <span
                        className="text-xs mb-1.5 block font-medium"
                        style={{ color: 'rgba(90, 200, 250, 0.8)' }}
                      >
                        🎤 음성 입력
                      </span>
                    )}

                    {/* 메시지 내용 — 반드시 white */}
                    <p
                      className="whitespace-pre-wrap break-words leading-relaxed"
                      style={{
                        color: '#FFFFFF',
                        fontSize: '15px',
                        lineHeight: '1.7',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      }}
                    >
                      {message.content}
                    </p>

                    {/* 하단: 시간 + TTS */}
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <p className="text-xs" style={{ color: '#FFFFFF' }}>
                        {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* AI 메시지에 TTS 버튼 */}
                      {!isUser && isTTSSupported && (
                        <button
                          onClick={() => handleSpeakMessage(message.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-0.5 rounded-full"
                          style={{
                            color: '#FFFFFF',
                            background: 'rgba(255,255,255,0.06)',
                          }}
                          title="읽어주기"
                        >
                          {isSpeaking ? '⏹️ 멈추기' : '🔊 읽어주기'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── 로딩 인디케이터 ── */}
          {loading && (
            <div className="flex items-end gap-4">
              <div
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: 'rgba(88, 86, 214, 0.15)',
                  border: '1.5px solid rgba(88,86,214,0.30)',
                }}
              >
                🤖
              </div>
              <div
                style={{
                  borderRadius: '20px',
                  padding: '16px 24px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs" style={{ color: '#FFFFFF' }}>
                    패스파인더가 생각 중
                  </span>
                  <div className="flex space-x-1.5">
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: '#5AC8FA', animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: '#007AFF', animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: '#5856D6', animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 음성 인식 중 표시 ── */}
          {isListening && (
            <div className="flex items-end gap-4 flex-row-reverse">
              <div
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: 'rgba(255, 59, 48, 0.15)',
                  border: '1.5px solid rgba(255,59,48,0.30)',
                }}
              >
                🎙️
              </div>
              <div
                style={{
                  borderRadius: '20px',
                  padding: '14px 24px',
                  background: 'rgba(255, 59, 48, 0.08)',
                  border: '1px solid rgba(255,59,48,0.20)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-white">
                    {interimTranscript || t('conversation.voice.listening') || '듣고 있어요... 🎧'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div
        className="shrink-0 px-4 sm:px-8 py-4"
        style={{
          background: 'rgba(10, 14, 26, 0.7)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center" style={{ gap: '12px' }}>
          {/* 음성 입력 버튼 — 48px 통일 */}
          {isSTTSupported && (
            <button
              onClick={handleVoiceToggle}
              disabled={loading}
              className="shrink-0 flex items-center justify-center transition-all"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: isListening ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isListening ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.10)'}`,
                color: isListening ? '#FF3B30' : '#FFFFFF',
              }}
              title={isListening ? '음성 인식 중지' : '음성 입력 🎤'}
            >
              {isListening ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}

          {/* 텍스트 입력 — 48px 통일 */}
          <input
            ref={inputRef}
            type="text"
            value={isListening ? input + interimTranscript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isListening
                ? t('conversation.voice.speaking') || '말씀하세요... 🎤'
                : (t('conversation.input.placeholder') || '메시지를 입력하세요') + ' ✨'
            }
            disabled={loading}
            className="flex-1 transition-all outline-none"
            style={{
              height: '48px',
              borderRadius: '16px',
              padding: '0 20px',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${isListening ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.10)'}`,
              color: '#FFFFFF',
              fontSize: '15px',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* 전송 버튼 — 48px 통일 */}
          <button
            onClick={() => sendMessage()}
            disabled={!(input.trim() || transcript) || loading}
            className="shrink-0 text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              height: '48px',
              borderRadius: '16px',
              padding: '0 24px',
              background: (input.trim() || transcript) && !loading
                ? 'linear-gradient(135deg, #007AFF, #5856D6)'
                : 'rgba(255,255,255,0.06)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: (input.trim() || transcript) && !loading
                ? '0 4px 16px rgba(0, 122, 255, 0.3)'
                : 'none',
            }}
          >
            보내기 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
