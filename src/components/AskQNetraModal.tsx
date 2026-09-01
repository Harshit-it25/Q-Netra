import React, { useState, useRef, useEffect } from 'react';
import { PaymentCheck } from '../types';
import { useLanguage } from '../services/i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/i18n/languages';
import { generateVoiceAnswer } from '../lib/voiceAssistant';
import { voiceService } from '../services/voice/voiceService';
import { IndiaFlag } from './IndiaFlag';

interface AskQNetraModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCheck?: PaymentCheck | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'qnetra';
  text: string;
  timestamp: string;
}

export const AskQNetraModal: React.FC<AskQNetraModalProps> = ({
  isOpen,
  onClose,
  activeCheck
}) => {
  const { language, bhashiniLocale, t, voiceAlertsEnabled } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(!voiceAlertsEnabled);
  const [voiceTelemetry, setVoiceTelemetry] = useState(() => voiceService.getTelemetry());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentLangInfo = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

  // Initialize speech & greeting on open or language change
  useEffect(() => {
    if (!isOpen) {
      voiceService.stop();
      setIsSpeaking(false);
      setIsListening(false);
      return;
    }

    const checkRecipient = activeCheck?.recipient || 'abc123@upi';
    const checkRisk = activeCheck?.riskLevel || 'HIGH RISK';

    setMessages([
      {
        id: 'm-init',
        sender: 'qnetra',
        text: t.voiceUi.askAiGreeting(checkRecipient, checkRisk),
        timestamp: 'Just now'
      }
    ]);
  }, [isOpen, activeCheck, language, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening]);

  if (!isOpen) return null;

  // Speak synthesized voice response in the selected language via VoiceService (BHASHINI -> Browser)
  const speakResponse = (text: string) => {
    if (voiceMuted) return;

    setIsSpeaking(true);
    voiceService.speak(text, {
      language: bhashiniLocale,
      forceReplay: true,
      onStart: () => {
        setIsSpeaking(true);
        setVoiceTelemetry(voiceService.getTelemetry());
      },
      onEnd: () => {
        setIsSpeaking(false);
        setVoiceTelemetry(voiceService.getTelemetry());
      },
      onError: () => {
        setIsSpeaking(false);
        setVoiceTelemetry(voiceService.getTelemetry());
      }
    });
  };

  const handleToggleListening = () => {
    if (isListening) {
      voiceService.stop();
      setIsListening(false);
    } else {
      voiceService.stop();
      setIsSpeaking(false);

      voiceService.listen({
        language: bhashiniLocale,
        onResult: (transcript: string) => {
          setIsListening(false);
          setVoiceTelemetry(voiceService.getTelemetry());
          if (transcript) {
            handleProcessQuestion(transcript);
          }
        },
        onError: (error: string) => {
          console.warn('Speech recognition event:', error);
          setIsListening(false);
          setVoiceTelemetry(voiceService.getTelemetry());
        },
        onEnd: () => {
          setIsListening(false);
          setVoiceTelemetry(voiceService.getTelemetry());
        }
      }).then((started) => {
        if (started) {
          setIsListening(true);
        }
        setVoiceTelemetry(voiceService.getTelemetry());
      });
    }
  };

  const handleProcessQuestion = (queryText: string) => {
    const query = queryText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const answerObj = generateVoiceAnswer(query, activeCheck, language);

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'qnetra',
      text: answerObj.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');

    // Trigger voice response in the selected language
    speakResponse(answerObj.text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleProcessQuestion(input);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#131313] border border-[#333333] rounded-2xl max-w-lg w-full h-[85vh] max-h-[680px] shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between bg-[#131313]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgba(171,214,0,0.15)] border border-[#abd600]/30 flex items-center justify-center text-[#abd600] relative">
              <span className="material-symbols-outlined text-[20px]">
                {isSpeaking ? 'volume_up' : 'mic'}
              </span>
              {isSpeaking && (
                <div className="absolute -inset-1 rounded-xl border border-[#abd600]/40 animate-ping pointer-events-none" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[16px] font-bold text-[#e5e2e1] font-['Inter']">
                  Q-NETRA Voice Assistant
                </h3>
                <span className="text-[9px] bg-[#1e2f0d] text-[#abd600] border border-[#abd600]/30 px-1.5 py-0.5 rounded font-mono-data font-bold uppercase flex items-center gap-1">
                  <IndiaFlag size="sm" />
                  <span>{currentLangInfo.nativeName}</span>
                </span>
              </div>
              <span className="text-[11px] text-[#c4c9ac] flex items-center gap-1 font-mono-data">
                <span className="w-1.5 h-1.5 rounded-full bg-[#abd600] inline-block animate-pulse"></span>
                <span>{t.voiceUi.askAiContext(activeCheck?.recipient || 'abc123@upi', activeCheck?.amount || 10)}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const nextMute = !voiceMuted;
                setVoiceMuted(nextMute);
                if (nextMute) voiceService.stop();
              }}
              title={voiceMuted ? 'Unmute voice' : 'Mute voice'}
              className="text-[#c4c9ac] hover:text-white p-1.5 rounded-full hover:bg-[#242424] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {voiceMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
            <button
              onClick={() => {
                voiceService.stop();
                onClose();
              }}
              className="text-[#c4c9ac] hover:text-white p-1.5 rounded-full hover:bg-[#242424] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Chat History & Voice Feedback */}
        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3.5 bg-[#0f0f0f]/90">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-[13px] sm:text-[14px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#abd600] text-[#0f1400] font-medium rounded-tr-none shadow-[0_0_15px_rgba(171,214,0,0.15)]'
                    : 'bg-[#1a1a1a] text-[#e5e2e1] border border-[#2e2e2e] rounded-tl-none font-normal'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-[#777] mt-1 px-1 font-mono-data">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isListening && (
            <div className="self-start flex items-center gap-2 bg-[#251010] border border-[#ffb4ab]/30 px-3.5 py-2.5 rounded-2xl rounded-tl-none">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping"></span>
              <span className="text-xs font-mono-data text-[#ffb4ab] font-bold">
                Listening ({currentLangInfo.nativeName})... Say your question
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Prompts Localized */}
        <div className="px-3 py-2 bg-[#141414] border-t border-[#2a2a2a] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {t.voiceUi.quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessQuestion(q)}
              className="text-[11px] font-mono-data bg-[#1f1f1f] hover:bg-[#2c2c2c] text-[#c4c9ac] hover:text-[#abd600] px-2.5 py-1 rounded-full whitespace-nowrap border border-[#333333] transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar with Voice Mic Button */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-[#131313] border-t border-[#333333] flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleToggleListening}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-[#ffb4ab] text-[#3b090e] border-[#ffb4ab] animate-pulse shadow-[0_0_15px_rgba(255,180,171,0.5)]'
                : 'bg-[#1e2f0d] text-[#abd600] border-[#abd600]/40 hover:bg-[#283e12]'
            }`}
            title={isListening ? 'Stop listening' : `Start speaking in ${currentLangInfo.nativeName}`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isListening ? 'mic_off' : 'mic'}
            </span>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.voiceUi.askAiPlaceholder}
            className="flex-grow bg-[#1c1c1c] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#e5e2e1] focus:outline-none focus:border-[#abd600]/60 placeholder-[#666] font-['Inter']"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-[#abd600] text-[#0A0A0A] p-2.5 rounded-xl font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b8e600] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
