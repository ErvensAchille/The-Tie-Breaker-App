import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, ChevronUp, Bot, ShieldAlert, Cpu, Zap, Radio, RefreshCw, Send, ArrowRight } from 'lucide-react';
import { DecisionAnalysisResult } from '../types/decision';

export type AssistantPersona = 'JARVIS' | 'FRIDAY';

export interface VoiceAssistantProps {
  currentResult: DecisionAnalysisResult | null;
  onAnalyzeDecision: (input: { title: string; description: string; options: string[]; selectedModelIds: string[] }) => void;
  onNavigateTab: (tab: 'workbench' | 'explorer' | 'history') => void;
  onNewDecision: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  persona: AssistantPersona;
  text: string;
  action?: any;
  timestamp: string;
}

export function VoiceAssistant({
  currentResult,
  onAnalyzeDecision,
  onNavigateTab,
  onNewDecision,
}: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<AssistantPersona>('JARVIS');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muteAudio, setMuteAudio] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      persona: 'JARVIS',
      text: "Good day, Boss. J.A.R.V.I.S. voice diagnostic interface online. Tell me what decision you're weighing, or ask me to analyze strategic models for your dilemma.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const handleSendMessageRef = useRef<any>(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, liveTranscript, isProcessing]);

  // Keep latest handleSendMessage ref fresh
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        latestTranscriptRef.current = '';
        setLiveTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        latestTranscriptRef.current = currentText;
        setLiveTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        const textToSend = latestTranscriptRef.current.trim();
        latestTranscriptRef.current = '';
        setLiveTranscript('');
        if (textToSend && handleSendMessageRef.current) {
          handleSendMessageRef.current(textToSend);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error starting speech recognition:', e);
        }
      } else {
        alert('Browser Speech Recognition is not supported in this environment. You can use the text box below to command JARVIS/FRIDAY.');
      }
    }
  };

  // Speak text via Gemini TTS API or browser SpeechSynthesis
  const speakResponse = async (textToSpeak: string, currentPersona: AssistantPersona) => {
    if (muteAudio) return;

    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);

    try {
      const response = await fetch('/api/assistant/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          persona: currentPersona,
          voiceStyle: 'siri',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
          if (currentPersona === 'FRIDAY') {
            audio.playbackRate = 0.92; // Comfortably measured speed for FRIDAY
          } else {
            audio.playbackRate = 1.0;
          }
          audioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => {
            setIsSpeaking(false);
            fallbackWebSpeech(textToSpeak, currentPersona);
          };
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini TTS endpoint call notice, using browser fallback:', e);
    }

    // Fallback to browser SpeechSynthesis
    fallbackWebSpeech(textToSpeak, currentPersona);
  };

  const fallbackWebSpeech = (text: string, currentPersona: AssistantPersona) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (currentPersona === 'FRIDAY') {
      utterance.rate = 0.90; // Natural, clear speaking speed
      utterance.pitch = 1.1; // Balanced, clear Siri-like pitch
    } else {
      utterance.rate = 0.95;
      utterance.pitch = 0.78; // Deep British executive pitch for JARVIS
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (currentPersona === 'FRIDAY') {
        const siriVoice = voices.find((v) =>
          v.name.includes('Siri') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen') ||
          (v.name.includes('Google') && v.name.includes('US') && v.lang.startsWith('en'))
        );
        if (siriVoice) utterance.voice = siriVoice;
      } else {
        const maleVoice = voices.find((v) =>
          v.name.includes('Daniel') ||
          v.name.includes('George') ||
          v.name.includes('Oliver') ||
          v.name.includes('Google UK English Male') ||
          (v.name.includes('Male') && v.lang.startsWith('en'))
        );
        if (maleVoice) utterance.voice = maleVoice;
      }
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Process user input
  const handleSendMessage = async (userMsgText: string) => {
    const trimmed = userMsgText.trim();
    if (!trimmed) return;

    // Deduplicate rapid duplicate messages
    let isDuplicate = false;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.sender === 'user' && last.text === trimmed) {
        isDuplicate = true;
        return prev;
      }
      return [
        ...prev,
        {
          id: 'msg_u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          sender: 'user',
          persona,
          text: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });

    if (isDuplicate) return;

    setTextInput('');
    setIsProcessing(true);

    try {
      const currentContext = currentResult
        ? {
            activeDecisionTitle: currentResult.decisionTitle,
            options: currentResult.options,
            overallTiebreakerSummary: currentResult.overallTiebreakerSummary,
            verdict: currentResult.analyses[0]?.verdict,
          }
        : null;

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          persona,
          currentContext,
        }),
      });

      let assistantReply = '';
      let actionData: any = null;

      if (response.ok) {
        const data = await response.json();
        assistantReply = data.reply;
        actionData = data;

        // Perform assistant action if detected
        if (data.action === 'FILL_DECISION_FORM' && data.decisionData) {
          onNavigateTab('workbench');
          onAnalyzeDecision({
            title: data.decisionData.title || userMsgText,
            description: data.decisionData.description || userMsgText,
            options: data.decisionData.options?.length ? data.decisionData.options : ['Option A', 'Option B'],
            selectedModelIds: data.decisionData.suggestedModelIds?.length ? data.decisionData.suggestedModelIds : ['eisenhower-matrix', 'swot-analysis'],
          });
        } else if (data.action === 'NAVIGATE' && data.targetTab) {
          onNavigateTab(data.targetTab);
        }
      } else {
        assistantReply = persona === 'FRIDAY'
          ? "Right away, Boss. Evaluating your decision vectors across top strategic models now."
          : "At your service, Sir. Analyzing your decision parameters and executing model synthesis on your Workbench.";

        onNavigateTab('workbench');
        onAnalyzeDecision({
          title: userMsgText.length > 60 ? userMsgText.slice(0, 57) + '...' : userMsgText,
          description: userMsgText,
          options: ['Option A: Pursue Primary Path', 'Option B: Maintain Current Baseline'],
          selectedModelIds: ['eisenhower-matrix', 'swot-analysis', 'rubber-band-model'],
        });
      }

      const assistantMessage: Message = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        persona,
        text: assistantReply,
        action: actionData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speakResponse(assistantReply, persona);
    } catch (err) {
      console.error('Assistant chat error:', err);
      const fallbackText = persona === 'FRIDAY'
        ? "Right away, Boss. Evaluating your decision vectors and deploying full analysis to your Workbench now."
        : "At your service, Sir. Analyzing decision parameters and executing model synthesis on your Workbench now.";
      
      const fallbackMsg: Message = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        persona,
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakResponse(fallbackText, persona);

      onNavigateTab('workbench');
      onAnalyzeDecision({
        title: userMsgText.length > 60 ? userMsgText.slice(0, 57) + '...' : userMsgText,
        description: userMsgText,
        options: ['Option A: Primary Initiative', 'Option B: Alternative Path'],
        selectedModelIds: ['eisenhower-matrix', 'swot-analysis', 'rubber-band-model'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick read-out of active decision tiebreaker verdict
  const handleReadVerdict = () => {
    if (!currentResult) {
      const text = persona === 'FRIDAY'
        ? "No active decision loaded on the Workbench, Boss. Input a dilemma or select one from history first!"
        : "Sir, there is currently no active decision under analysis on the Workbench. Kindly initiate a decision evaluation first.";
      speakResponse(text, persona);
      return;
    }

    const summaryText = `${persona === 'FRIDAY' ? 'Boss' : 'Sir'}, here is the tiebreaker brief for "${currentResult.decisionTitle}": ${currentResult.overallTiebreakerSummary}`;
    speakResponse(summaryText, persona);
  };

  return (
    <>
      {/* Floating HUD Arc Reactor Trigger Orb */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Pulsing indicator when processing/speaking */}
        {(isListening || isProcessing || isSpeaking) && (
          <div className="mb-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center space-x-2 shadow-lg animate-pulse">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>
              {isListening ? 'LISTENING...' : isProcessing ? 'CALCULATING VECTORS...' : 'TRANSMITTING VOICE...'}
            </span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group flex items-center justify-center p-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border ${
            isOpen
              ? 'bg-slate-900 text-cyan-400 border-cyan-400/60 ring-2 ring-cyan-400/30'
              : 'bg-slate-900 text-white border-slate-700 hover:border-cyan-400/50'
          }`}
          title="Open JARVIS / FRIDAY AI Voice Assistant"
        >
          {/* Animated Arc Reactor Outer Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 opacity-30 group-hover:opacity-75 blur-xs transition duration-300"></span>
          
          <div className="relative flex items-center space-x-2 px-1">
            <div className="relative">
              <Cpu className="w-6 h-6 text-cyan-400" />
              {(isListening || isSpeaking) && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold font-mono tracking-wider text-slate-200">
              {persona}
            </span>
          </div>
        </button>
      </div>

      {/* Expanded Holographic Assistant HUD Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[80vh] h-[540px] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 font-sans border-t-2 border-t-cyan-500/80">
          
          {/* HUD Header Bar */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-bold tracking-widest text-cyan-400">
                      ACHILLE TECH
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      v4.2
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-serif tracking-tight">
                    {persona === 'JARVIS' ? 'J.A.R.V.I.S. Core' : 'F.R.I.D.A.Y. Tactical'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {/* Persona Selector Toggle */}
                <div className="p-0.5 rounded-lg bg-slate-800 border border-slate-700 flex text-[10px] font-mono">
                  <button
                    onClick={() => {
                      setPersona('JARVIS');
                      speakResponse("J.A.R.V.I.S. online, Sir. Systems functioning at full capacity.", 'JARVIS');
                    }}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      persona === 'JARVIS'
                        ? 'bg-cyan-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JARVIS
                  </button>
                  <button
                    onClick={() => {
                      setPersona('FRIDAY');
                      speakResponse("F.R.I.D.A.Y. active, Boss. Standing by for strategic vectors.", 'FRIDAY');
                    }}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      persona === 'FRIDAY'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    FRIDAY
                  </button>
                </div>

                {/* Mute Audio Toggle */}
                <button
                  onClick={() => setMuteAudio(!muteAudio)}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors ${
                    muteAudio ? 'text-rose-400 bg-rose-950/30' : ''
                  }`}
                  title={muteAudio ? 'Unmute Spoken Responses' : 'Mute Spoken Responses'}
                >
                  {muteAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Holographic Diagnostic Visualizer Bar */}
          <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-cyan-400 animate-ping' : isSpeaking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              <span>
                {isListening
                  ? 'RECORDING SPEECH...'
                  : isSpeaking
                  ? 'SPEAKING BRIEFS...'
                  : isProcessing
                  ? 'PROCESSING MODELS...'
                  : 'SYSTEMS NOMINAL'}
              </span>
            </div>

            {currentResult && (
              <button
                onClick={handleReadVerdict}
                className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-sans text-xs underline underline-offset-2"
              >
                <Sparkles className="w-3 h-3" />
                <span>Read Verdict Aloud</span>
              </button>
            )}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none font-medium'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-mono font-bold text-cyan-400">
                      <Bot className="w-3 h-3" />
                      <span>{msg.persona} ASSISTANT</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Live speech transcription preview */}
            {isListening && liveTranscript && (
              <div className="flex flex-col items-end">
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 italic animate-pulse">
                  "{liveTranscript}..."
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isProcessing && (
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{persona} is analyzing strategic vectors...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Voice Command Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-500 font-mono text-[10px] uppercase flex-shrink-0">Try:</span>
            <button
              onClick={() => handleSendMessage("Evaluate decision: Launch new product line vs optimize existing core product.")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
            >
              "Evaluate new product launch"
            </button>
            <button
              onClick={() => handleSendMessage("What strategic models should I use for career choices?")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
            >
              "Career choices models"
            </button>
            <button
              onClick={() => onNavigateTab('history')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
            >
              "Go to History"
            </button>
          </div>

          {/* Voice Mic & Text Command Entry Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak Command'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(textInput);
              }}
              className="flex-1 flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-cyan-500"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening to voice input..."
                    : `Command ${persona} (e.g. "Evaluate option A vs option B")...`
                }
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isProcessing}
                className="p-1 rounded-lg text-cyan-400 hover:text-cyan-200 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
