'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

const languageMap: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  es: 'es-ES',
  ja: 'ja-JP',
};

export function useSpeechSynthesis(language: string = 'ko'): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const findBestVoice = useCallback(
    (lang: string) => {
      const targetLang = languageMap[lang] || 'en-US';
      // 우선순위: 정확한 언어 매칭 → 언어코드 앞부분 매칭
      const exactMatch = voices.find((v) => v.lang === targetLang);
      if (exactMatch) return exactMatch;

      const partialMatch = voices.find((v) => v.lang.startsWith(lang));
      if (partialMatch) return partialMatch;

      return null;
    },
    [voices]
  );

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;

      // 이전 발화 중지
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // 음성 설정
      const voice = findBestVoice(language);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = languageMap[language] || 'en-US';
      utterance.rate = 0.9; // 청소년이 이해하기 쉬운 속도
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, language, findBestVoice]
  );

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
    voices,
  };
}

