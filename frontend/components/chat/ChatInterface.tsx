'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
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

  // 언어 기본값 설정 (null이면 'en' 사용)
  const currentLanguage = language || 'en';

  // 음성 인식 훅
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSTTSupported,
  } = useSpeechRecognition(currentLanguage);

  // 음성 합성 훅
  const {
    speak,
    cancel: cancelSpeak,
    isSpeaking,
    isSupported: isTTSSupported,
  } = useSpeechSynthesis(currentLanguage);

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

  // 마크다운 문법을 제거하여 순수 텍스트로 변환
  const stripMarkdown = useCallback((text: string): string => {
    return text
      // 볼드 제거: **텍스트** 또는 __텍스트__ -> 텍스트
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      // 이탤릭 제거: *텍스트* 또는 _텍스트_ -> 텍스트
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // 링크 제거: [텍스트](url) -> 텍스트
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // 코드 블록 제거: `코드` -> 코드
      .replace(/`([^`]+)`/g, '$1')
      // 헤더 제거: # 텍스트 -> 텍스트
      .replace(/^#{1,6}\s+(.*)$/gm, '$1')
      // 리스트 마커 제거: - 텍스트 또는 * 텍스트 -> 텍스트
      .replace(/^[\*\-\+]\s+(.*)$/gm, '$1')
      // 번호 리스트 제거: 1. 텍스트 -> 텍스트
      .replace(/^\d+\.\s+(.*)$/gm, '$1')
      // 인용 제거: > 텍스트 -> 텍스트
      .replace(/^>\s+(.*)$/gm, '$1')
      // 줄바꿈 정리
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, []);

  // 긴 텍스트를 여러 세그먼트로 나누기 (자연스러운 문장 단위로)
  const splitIntoSegments = useCallback((text: string): string[] => {
    // 문장 끝 패턴 (마침표, 느낌표, 물음표, 이모지 뒤 공백 등)
    const sentenceEnders = /([.!?。！？]\s+|[\u{1F300}-\u{1F9FF}]\s+|:\s+)/gu;
    
    // 문장 단위로 나누기
    const parts = text.split(sentenceEnders);
    const sentences: string[] = [];
    
    // 문장과 구분자를 합쳐서 완전한 문장 만들기
    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i];
      const delimiter = parts[i + 1] || '';
      if (sentence && sentence.trim().length > 0) {
        sentences.push(sentence + delimiter);
      }
    }
    
    const segments: string[] = [];
    let currentSegment = '';
    let currentLength = 0;
    const maxLength = 250; // 각 세그먼트의 최대 길이 (약 2-3문장)
    const minLength = 80; // 최소 길이 (너무 짧게 나누지 않기)

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceLength = sentence.trim().length;

      // 현재 세그먼트에 문장 추가 시 최대 길이를 초과하는 경우
      if (currentLength + sentenceLength > maxLength && currentLength >= minLength) {
        segments.push(currentSegment.trim());
        currentSegment = sentence;
        currentLength = sentenceLength;
      } else {
        currentSegment += sentence;
        currentLength += sentenceLength;
      }
    }

    // 마지막 세그먼트 추가
    if (currentSegment.trim().length > 0) {
      segments.push(currentSegment.trim());
    }

    // 세그먼트가 1개면 그대로 반환
    if (segments.length === 1) {
      return segments;
    }

    // 최대 3개로 제한 (너무 많이 나누지 않기)
    if (segments.length > 3) {
      const result: string[] = [];
      const chunkSize = Math.ceil(segments.length / 3);
      for (let i = 0; i < segments.length; i += chunkSize) {
        result.push(segments.slice(i, i + chunkSize).join(' '));
      }
      return result;
    }

    return segments;
  }, []);

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
    
    // 메시지 전송 후 즉시 입력창에 포커스 (다음 메시지 입력 준비)
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    
    // 메시지 전송 후 즉시 입력창에 포커스
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    try {
      const { apiClient } = await import('@/lib/api/client');
      const response = await apiClient.sendMessage(
        sessionId,
        userMessage.content,
        userMessage.input_method || 'text'
      );

      // AI 응답을 여러 세그먼트로 나누기
      const segments = splitIntoSegments(response.ai_response.content);
      
      // 각 세그먼트를 약간의 딜레이를 두고 순차적으로 표시
      for (let i = 0; i < segments.length; i++) {
        const delay = i * 800; // 각 세그먼트 사이 800ms 딜레이
        
        setTimeout(() => {
          const aiMessage: ConversationMessage = {
            message_id: `ai-${Date.now()}-${i}`,
            role: 'assistant',
            content: segments[i],
            timestamp: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, aiMessage]);
          
          // 마지막 세그먼트일 때만 진행도 업데이트 및 완료 체크
          if (i === segments.length - 1) {
            setProgress(response.progress);
            onProgressUpdate?.(response.progress);
            
            // 자동 음성 출력이 켜져 있으면 전체 응답을 읽어줌 (마크다운 제거)
            if (autoSpeak && isTTSSupported) {
              const cleanText = stripMarkdown(response.ai_response.content);
              speak(cleanText);
            }
            
            // 대화 완료 체크 (0.95 이상일 때만 완료로 간주)
            if (response.progress >= 0.95) {
              // 약간의 딜레이를 두고 완료 처리 (사용자가 마지막 메시지를 볼 수 있도록)
              setTimeout(() => {
                onComplete?.();
              }, 1000);
            }
            
            // 로딩 상태 해제
            setLoading(false);
            // AI 응답 완료 후 입력창에 포커스 (약간의 딜레이로 자연스럽게)
            setTimeout(() => {
              inputRef.current?.focus();
            }, 150);
          }
        }, delay);
      }
      
      // 세그먼트가 1개인 경우 즉시 로딩 해제
      if (segments.length === 1) {
        setLoading(false);
        // 즉시 포커스
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }

      // 대화 완료 체크 (0.95 이상일 때만 완료로 간주)
      if (response.progress >= 0.95) {
        // 약간의 딜레이를 두고 완료 처리
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((msg) => msg.message_id !== userMessage.message_id));
      alert(error.message || '메시지 전송에 실패했습니다');
      setLoading(false);
      // 에러 발생 시에도 입력창에 포커스
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [input, loading, sessionId, onProgressUpdate, onComplete, autoSpeak, isTTSSupported, speak, stripMarkdown, splitIntoSegments]);

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
      // 마크다운 제거 후 읽기
      const cleanText = stripMarkdown(text);
      speak(cleanText);
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
    if (progress >= 0.8) return t('conversation.progress.almost');
    if (progress >= 0.6) return t('conversation.progress.good');
    if (progress >= 0.4) return t('conversation.progress.half');
    if (progress >= 0.2) return t('conversation.progress.starting');
    return t('conversation.progress.start');
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
                    maxWidth: 'min(75%, 600px)',
                    minWidth: '80px',
                  }}
                >
                  {/* 발신자 라벨 */}
                  <p
                    className={`text-xs mb-2 font-medium ${isUser ? 'text-right' : 'text-left'}`}
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {isUser ? t('conversation.user.label') : t('conversation.pathfinder.label')}
                  </p>

                  <div
                    className={`relative`}
                    style={{
                      padding: '16px 20px 15px 20px',
                      borderRadius: isUser 
                        ? '20px 20px 20px 20px' // 사용자: 모든 모서리 둥글게
                        : '20px 20px 20px 20px', // AI: 모든 모서리 둥글게
                      background: isUser
                        ? 'linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246))'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: isUser
                        ? 'none'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: isUser
                        ? '0 8px 32px rgba(99, 102, 241, 0.25)'
                        : '0 8px 32px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {/* 음성 입력 배지 */}
                    {message.input_method === 'voice' && isUser && (
                      <span
                        className="text-xs mb-2 block font-medium opacity-80"
                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      >
                        {t('conversation.voice.input')}
                      </span>
                    )}

                    {/* 메시지 내용 — 마크다운 렌더링 */}
                    <div
                      className="break-words"
                      style={{
                        color: '#FFFFFF',
                        fontSize: '15px',
                        lineHeight: '1.7',
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p style={{ margin: '0 0 10px 0', color: '#FFFFFF' }}>{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong
                              style={{
                                color: '#FFD700', // 옐로우 컬러로 강조
                                letterSpacing: '0.01em',
                              }}
                            >
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em
                              style={{
                                fontStyle: 'italic',
                                color: 'rgba(255, 255, 255, 0.95)',
                              }}
                            >
                              {children}
                            </em>
                          ),
                          ul: ({ children }) => (
                            <ul
                              style={{
                                margin: '10px 0',
                                paddingLeft: '24px',
                                color: '#FFFFFF',
                                listStyleType: 'disc',
                              }}
                            >
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol
                              style={{
                                margin: '10px 0',
                                paddingLeft: '24px',
                                color: '#FFFFFF',
                                listStyleType: 'decimal',
                              }}
                            >
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li
                              style={{
                                margin: '6px 0',
                                color: '#FFFFFF',
                                lineHeight: '1.6',
                              }}
                            >
                              {children}
                            </li>
                          ),
                          code: ({ children }) => (
                            <code
                              style={{
                                background: 'rgba(0, 0, 0, 0.25)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                                color: '#FFFFFF',
                                fontWeight: '500',
                              }}
                            >
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote
                              style={{
                                borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
                                paddingLeft: '16px',
                                margin: '12px 0',
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontStyle: 'italic',
                              }}
                            >
                              {children}
                            </blockquote>
                          ),
                          h1: ({ children }) => (
                            <h1
                              style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                margin: '12px 0 8px 0',
                                color: '#FFFFFF',
                              }}
                            >
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2
                              style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: '10px 0 6px 0',
                                color: '#FFFFFF',
                              }}
                            >
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3
                              style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                margin: '8px 0 4px 0',
                                color: '#FFFFFF',
                              }}
                            >
                              {children}
                            </h3>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* 하단: 시간 + TTS */}
                    <div className="flex items-center justify-between mt-3 gap-2 pt-2 border-t border-white/10" style={{ marginBottom: 0, paddingBottom: 0 }}>
                      <p className="text-xs opacity-70" style={{ color: '#FFFFFF', marginBottom: 0 }}>
                        {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* AI 메시지에 TTS 버튼 */}
                      {!isUser && isTTSSupported && (
                        <button
                          onClick={() => handleSpeakMessage(message.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-3 py-1 rounded-full hover:bg-white/10"
                          style={{
                            color: '#FFFFFF',
                            background: 'rgba(255,255,255,0.08)',
                          }}
                          title="읽어주기"
                        >
                          {isSpeaking ? '⏹️' : '🔊'}
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
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs" style={{ color: '#FFFFFF' }}>
                    {t('conversation.thinking')}
                  </span>
                  {/* 별이 도는 효과 */}
                  <div className="relative" style={{ width: '16px', height: '16px' }}>
                    <div
                      className="absolute inset-0"
                      style={{
                        animation: 'spin 2s linear infinite',
                      }}
                    >
                      <span style={{ fontSize: '12px' }}>⭐</span>
                    </div>
                  </div>
                  {/* 점 3개 애니메이션 */}
                  <div className="flex items-center gap-1" style={{ marginLeft: '4px' }}>
                    <span
                      className="text-white"
                      style={{
                        fontSize: '16px',
                        animation: 'dot1 1.4s infinite',
                        animationDelay: '0s',
                      }}
                    >
                      .
                    </span>
                    <span
                      className="text-white"
                      style={{
                        fontSize: '16px',
                        animation: 'dot2 1.4s infinite',
                        animationDelay: '0.2s',
                      }}
                    >
                      .
                    </span>
                    <span
                      className="text-white"
                      style={{
                        fontSize: '16px',
                        animation: 'dot3 1.4s infinite',
                        animationDelay: '0.4s',
                      }}
                    >
                      .
                    </span>
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
                  padding: '14px 20px',
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255,59,48,0.25)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
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
      <div className="shrink-0 px-4 sm:px-6" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="flex items-center max-w-4xl mx-auto" style={{ gap: '12px' }}>
          {/* 음성 입력 버튼 */}
          {isSTTSupported && (
            <button
              onClick={handleVoiceToggle}
              disabled={loading}
              className="shrink-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isListening ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${isListening ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.12)'}`,
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

          {/* 텍스트 입력 — 캡슐 모양 */}
          <input
            ref={inputRef}
            type="text"
            value={isListening ? input + interimTranscript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isListening
                ? t('conversation.voice.speaking') || '말씀하세요... 🎤'
                : t('conversation.input.placeholder') || '메시지를 입력하세요'
            }
            disabled={loading}
            className="flex-1 transition-all outline-none focus:ring-2 focus:ring-indigo-500/50"
            style={{
              height: '48px',
              borderRadius: '9999px',
              padding: '0 24px',
              background: 'rgba(255,255,255,0.1)',
              border: `1px solid ${isListening ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.15)'}`,
              color: '#FFFFFF',
              fontSize: '15px',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* 전송 버튼 — 비행기 아이콘 */}
          <button
            onClick={() => sendMessage()}
            disabled={!(input.trim() || transcript) || loading}
            className="shrink-0 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '9999px',
              background: (input.trim() || transcript) && !loading
                ? 'linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246))'
                : 'rgba(255,255,255,0.08)',
              border: (input.trim() || transcript) && !loading
                ? 'none'
                : '1px solid rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              boxShadow: (input.trim() || transcript) && !loading
                ? '0 4px 20px rgba(99, 102, 241, 0.4)'
                : 'none',
            }}
            title="보내기"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
