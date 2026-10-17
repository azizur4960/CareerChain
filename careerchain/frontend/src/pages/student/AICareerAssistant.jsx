import React, { Suspense, lazy, useState, useRef, useEffect } from 'react';
import { aiApi } from '../../api/ai';
import { useAuth } from '../../hooks/useAuth';
import {
  Bot,
  User,
  Send,
  Sparkles,
  BookOpen,
  Info,
  Loader2,
  RotateCcw,
  Mic,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

const ReactMarkdown = lazy(() => import('react-markdown'));

const createWelcomeMessage = (name) => ({
  role: 'assistant',
  content: `Hello ${name || 'there'}! I can help with career paths, resumes, interview preparation, learning roadmaps, job applications, and alumni referrals. What are you working toward?`,
  sources: [],
});

const AICareerAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => [createWelcomeMessage(user?.full_name?.split(' ')[0])]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const [speakingMessage, setSpeakingMessage] = useState(null);
  const [voiceError, setVoiceError] = useState('');

  const messagesContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not available in this browser. You can still type your question.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = voiceLanguage;
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) setInputMessage((current) => `${current ? `${current} ` : ''}${transcript}`);
        setVoiceError('');
      };
      recognition.onerror = (event) => {
        const messagesByError = {
          'not-allowed': 'Microphone access is blocked. Allow microphone access in your browser settings.',
          'service-not-allowed': 'Speech recognition is not allowed by this browser.',
          'no-speech': 'No speech was detected. Try again or type your question.',
        };
        setVoiceError(messagesByError[event.error] || 'Voice input stopped. Try again or type your question.');
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      setVoiceError('');
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError('Could not start voice input. Please try again or type your question.');
    }
  };

  const toggleSpeech = (content, messageIndex) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setVoiceError('Read aloud is not available in this browser.');
      return;
    }
    if (speakingMessage === messageIndex) {
      window.speechSynthesis.cancel();
      setSpeakingMessage(null);
      return;
    }
    window.speechSynthesis.cancel();
    const plainText = content
      .replace(/```[\s\S]*?```/g, ' Code example omitted. ')
      .replace(/[#*_`>\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new window.SpeechSynthesisUtterance(plainText);
    utterance.lang = /[\u0980-\u09FF]/.test(plainText) ? 'bn-BD' : 'en-US';
    utterance.onend = () => setSpeakingMessage(null);
    utterance.onerror = () => setSpeakingMessage(null);
    setVoiceError('');
    setSpeakingMessage(messageIndex);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend = null) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || loading) return;
    setVoiceError('');
    window.speechSynthesis?.cancel();
    setSpeakingMessage(null);

    const userMsg = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const response = await aiApi.chatAssistant({
        message: messageText,
        target_role: user?.student_profile?.target_role || undefined,
        history: messages
          .filter((message) => !message.retryPrompt)
          .slice(-8)
          .map(({ role, content }) => ({ role, content })),
      });

      const assistantMsg = {
        role: 'assistant',
        content: response.reply,
        intent: response.intent,
        supported: response.supported,
        sources: response.retrieved_sources || [],
        suggestions: response.suggestions || [],
        disclaimer: response.disclaimer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.response?.data?.detail || 'I could not retrieve an answer. Please try again.',
          sources: [],
          retryPrompt: messageText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const targetRole = user?.student_profile?.target_role;
  const suggestedPrompts = [
    `Create a 30-day learning plan for ${targetRole || 'a software career'}.`,
    `Suggest a portfolio project for ${targetRole || 'a junior developer'}.`,
    `Give me interview practice for ${targetRole || 'a junior software role'}.`,
    'Help me write a concise message to a DIU alumni for career advice.',
  ];

  const startNewConversation = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setIsListening(false);
    setSpeakingMessage(null);
    setVoiceError('');
    setMessages([createWelcomeMessage(user?.full_name?.split(' ')[0])]);
    setInputMessage('');
  };

  return (
    <section aria-label="Career assistant conversation" className="mx-auto flex h-[min(760px,calc(100vh-140px))] min-h-[480px] max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-700 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">CareerChain AI Assistant</h2>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                DIU-grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Grounded on DIU Career Tracks & Industry Guidance
            </p>
          </div>
        </div>

        <button type="button" aria-label="Start new conversation" title="Start new conversation" onClick={startNewConversation} disabled={loading || messages.length === 1} className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">New conversation</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
          <div ref={messagesContainerRef} aria-live="polite" aria-busy={loading} className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[85%] rounded-xl p-4 text-sm leading-6 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-sm rounded-tr-none'
                  : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none space-y-3'
              }`}
            >
              {msg.intent && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {msg.supported === false ? 'Outside career support' : msg.intent.replaceAll('_', ' ')}
                  </span>
                  {msg.supported === false && <Info className="h-3.5 w-3.5 text-amber-600" aria-label="Career-related questions only" />}
                </div>
              )}
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              ) : (
                <Suspense fallback={<div className="whitespace-pre-wrap break-words">{msg.content}</div>}>
                  <ReactMarkdown
                    components={{
                      h3: ({ children }) => <h3 className="text-sm font-bold text-slate-900">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-xs font-bold text-slate-900">{children}</h4>,
                      p: ({ children }) => <p className="leading-6">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
                      li: ({ children }) => <li className="pl-0.5">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </Suspense>
              )}

              {/* Retrieved Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                  <p className="text-[10px] font-bold text-indigo-900 flex items-center gap-1 mb-1">
                    <BookOpen className="h-3 w-3" />
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200"
                      >
                        {src.title} ({src.category})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {msg.disclaimer && (
                <p className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-200/40">
                  {msg.disclaimer}
                </p>
              )}
              {msg.retryPrompt && (
                <button type="button" onClick={() => handleSend(msg.retryPrompt)} disabled={loading} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                  <RotateCcw className="h-3.5 w-3.5" />Retry
                </button>
              )}
              {msg.role === 'assistant' && msg.content && <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-2">
                <button type="button" onClick={() => toggleSpeech(msg.content, idx)} className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-slate-600 hover:bg-white hover:text-indigo-800" aria-label={speakingMessage === idx ? 'Stop reading answer aloud' : 'Read answer aloud'}>
                  {speakingMessage === idx ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{speakingMessage === idx ? 'Stop reading' : 'Read aloud'}
                </button>
                {msg.suggestions?.map((suggestion) => <button key={suggestion} type="button" onClick={() => handleSend(suggestion)} disabled={loading} className="min-h-9 rounded-full border border-slate-200 bg-white px-3 text-left text-xs font-medium text-indigo-800 hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50">{suggestion}</button>)}
              </div>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 p-4 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Checking your question against DIU career knowledge...</span>
            </div>
          </div>
        )}

      </div>

      {/* Suggested Prompts Banner */}
      {messages.length <= 2 && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-800 transition-colors text-left disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          aria-label="Send a career question"
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
              maxLength={2000}
              placeholder="Ask about a career path, resume, interview, or job search..."
            className="cc-control min-w-0 flex-1"
          />
          <select value={voiceLanguage} onChange={(event) => setVoiceLanguage(event.target.value)} aria-label="Voice input language" className="cc-control max-w-28 px-2 text-xs">
            <option value="en-US">English</option>
            <option value="bn-BD">বাংলা</option>
          </select>
          <button type="button" onClick={toggleVoiceInput} disabled={loading} aria-label={isListening ? 'Stop voice input' : 'Start voice input'} title={isListening ? 'Stop voice input' : 'Speak your question'} className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${isListening ? 'bg-rose-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>
            {isListening ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
          </button>
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            aria-label="Send message"
            title="Send message"
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white transition-colors hover:bg-indigo-800 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        {(voiceError || isListening) && <div aria-live="polite" className={`mt-2 flex items-center justify-between gap-2 text-xs ${voiceError ? 'text-rose-700' : 'text-indigo-700'}`}>
          <span>{voiceError || `Listening in ${voiceLanguage === 'bn-BD' ? 'Bengali' : 'English'}… Speak now, then review the transcript before sending.`}</span>
          {voiceError && <button type="button" onClick={() => setVoiceError('')} aria-label="Dismiss voice message" className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>}
        </div>}
      </div>
    </section>
  );
};

export default AICareerAssistant;
