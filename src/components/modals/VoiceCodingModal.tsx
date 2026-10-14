import React, { useState, useEffect } from 'react';
import { useIDE } from '../../context/IDEContext';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Loader2,
  Terminal,
  FileCode,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { speechRecognitionService } from '../../services/speechRecognitionService';
import { SpeechRecognitionState, VoiceCodingExecutionPlan } from '../../types/voiceCoding';

export const VoiceCodingModal: React.FC = () => {
  const {
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    voiceCodingEngine,
    openFile,
  } = useIDE();

  const [state, setState] = useState<SpeechRecognitionState>('idle');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [simulatedInput, setSimulatedInput] = useState('');
  const [activePlan, setActivePlan] = useState<VoiceCodingExecutionPlan | null>(null);
  const [spokenFeedback, setSpokenFeedback] = useState<string>('');
  const [ttsEnabled, setTtsEnabled] = useState(true);

  useEffect(() => {
    voiceCodingEngine.setListener((newState, session) => {
      setState(newState);
      if (session?.plan) setActivePlan(session.plan);
      if (session?.spokenResponse) setSpokenFeedback(session.spokenResponse);
      if (session?.transcript.text) setFinalTranscript(session.transcript.text);
    });

    const unsubPartial = speechRecognitionService.onPartialTranscript((text) => {
      setPartialTranscript(text);
    });

    const unsubFinal = speechRecognitionService.onFinalTranscript((text) => {
      setFinalTranscript(text);
      setPartialTranscript('');
    });

    return () => {
      unsubPartial();
      unsubFinal();
    };
  }, [voiceCodingEngine]);

  if (!isVoiceModalOpen) return null;

  const handleStartRecording = async () => {
    setActivePlan(null);
    setSpokenFeedback('');
    setFinalTranscript('');
    setPartialTranscript('');
    await voiceCodingEngine.startListening();
    setState('listening');
  };

  const handleStopRecording = async () => {
    await voiceCodingEngine.stopAndProcess();
  };

  const handleCancel = async () => {
    await voiceCodingEngine.cancel();
    setIsVoiceModalOpen(false);
  };

  const handleSimulateSubmit = async (text: string) => {
    setFinalTranscript(text);
    setPartialTranscript('');
    setState('processing');
    const session = {
      id: `vcs-${Date.now()}`,
      transcript: {
        id: `vt-${Date.now()}`,
        text,
        startedAt: Date.now() - 2000,
        completedAt: Date.now(),
        confidence: 0.98,
        segments: [{ text, confidence: 0.98, timestamp: Date.now(), isFinal: true }],
      },
      state: 'processing' as SpeechRecognitionState,
    };
    await voiceCodingEngine.processVoiceCommand(text, session);
  };

  const getStateBadge = () => {
    switch (state) {
      case 'listening':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Listening...
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            Processing Audio...
          </span>
        );
      case 'planning':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Synthesizing Plan...
          </span>
        );
      case 'executing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
            Executing Tools & Files...
          </span>
        );
      case 'testing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Terminal className="w-3 h-3 text-purple-400" />
            Running Tests...
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Voice Coding Assistant</h2>
                {getStateBadge()}
              </div>
              <p className="text-xs text-slate-400">Speak naturally to inspect, plan, write code, run commands, and verify.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`p-1.5 rounded-lg border transition-colors ${
                ttsEnabled ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title={ttsEnabled ? 'Spoken speech synthesis enabled' : 'Spoken synthesis muted'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Audio Visualizer & Waveform Simulation */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
            <div className="flex items-center gap-1.5 h-10">
              {[40, 65, 30, 85, 95, 55, 35, 75, 45, 60, 90, 40].map((h, i) => (
                <div
                  key={i}
                  style={{ height: state === 'listening' ? `${h}%` : '20%' }}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    state === 'listening' ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Transcript display */}
            <div className="w-full text-center min-h-[48px] flex items-center justify-center">
              {partialTranscript ? (
                <p className="text-sm text-indigo-300 font-medium italic">"{partialTranscript}..."</p>
              ) : finalTranscript ? (
                <p className="text-sm text-slate-200 font-medium">"{finalTranscript}"</p>
              ) : (
                <p className="text-xs text-slate-500">Click the microphone to start speaking, or choose an example below.</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              {state === 'listening' ? (
                <button
                  onClick={handleStopRecording}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all"
                >
                  <Square className="w-4 h-4" />
                  Stop & Process Command
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all"
                >
                  <Mic className="w-4 h-4" />
                  Start Listening
                </button>
              )}
            </div>
          </div>

          {/* Quick Voice Prompt Examples */}
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Example Voice Commands</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                'Add dark mode and remember user choice',
                'Run the tests and fix whatever is failing',
                'Start the application dev server',
                'Refactor auth middleware to add token refresh',
              ].map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateSubmit(cmd)}
                  className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{cmd}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Generated Execution Plan */}
          {activePlan && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Generated Autonomous Plan</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activePlan.estimatedRisk === 'destructive'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  Risk: {activePlan.estimatedRisk.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                {activePlan.steps.map((step, i) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200">{step.description}</p>
                      {step.targetFile && (
                        <p
                          onClick={() => openFile(step.targetFile!)}
                          className="text-[11px] text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 mt-1 font-mono"
                        >
                          <FileCode className="w-3 h-3" />
                          {step.targetFile}
                        </p>
                      )}
                      {step.result && (
                        <p className="text-[11px] text-slate-400 mt-1 font-mono bg-slate-950/60 p-1.5 rounded">
                          ✓ {step.result}
                        </p>
                      )}
                    </div>
                    {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {step.status === 'executing' && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
                  </div>
                ))}
              </div>

              {activePlan.requiresConfirmation && activePlan.steps.some(s => s.status === 'pending') && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Safety Confirmation required for this operation.</span>
                  </div>
                  <button
                    onClick={() => {
                      const session = voiceCodingEngine.getSession();
                      if (session && activePlan) {
                        activePlan.requiresConfirmation = false;
                        voiceCodingEngine.executePlan(activePlan, session);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                  >
                    Authorize & Execute
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Spoken Response Feedback */}
          {spokenFeedback && (
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-white">Voice Assistant Verbal Summary:</p>
                <p className="text-indigo-200/90 mt-0.5">{spokenFeedback}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Powered by Real Speech Recognition & Project Intelligence</span>
          </div>
          <button
            onClick={() => setIsVoiceModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
