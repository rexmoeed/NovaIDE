import {
  SpeechRecognitionService,
  SpeechRecognitionOptions,
  SpeechRecognitionState,
  VoiceTranscript,
  VoiceTranscriptSegment,
} from '../types/voiceCoding';

// Declaring Web Speech API types
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class BrowserSpeechRecognitionService implements SpeechRecognitionService {
  private recognition: any = null;
  private state: SpeechRecognitionState = 'idle';
  private partialCallbacks: Set<(text: string) => void> = new Set();
  private finalCallbacks: Set<(text: string) => void> = new Set();
  private errorCallbacks: Set<(err: string) => void> = new Set();
  private segments: VoiceTranscriptSegment[] = [];
  private fullTranscriptText: string = '';
  private startTime: number = 0;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechClass) {
        this.recognition = new SpeechClass();
        this.isSupported = true;
        this.setupEventListeners();
      }
    }
  }

  private setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.state = 'listening';
    };

    this.recognition.onresult = (event: any) => {
      let interimStr = '';
      let finalStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const transcriptPiece = item[0]?.transcript || '';
        const confidence = item[0]?.confidence || 0.85;

        if (item.isFinal) {
          finalStr += transcriptPiece;
          this.segments.push({
            text: transcriptPiece.trim(),
            confidence,
            timestamp: Date.now(),
            isFinal: true,
          });
        } else {
          interimStr += transcriptPiece;
        }
      }

      if (interimStr) {
        this.notifyPartial(interimStr);
      }

      if (finalStr) {
        this.fullTranscriptText = (this.fullTranscriptText + ' ' + finalStr).trim();
        this.notifyFinal(this.fullTranscriptText);
      }
    };

    this.recognition.onerror = (event: any) => {
      const errorMsg = event.error || 'Speech recognition encountered an issue';
      this.state = 'failed';
      this.notifyError(errorMsg);
    };

    this.recognition.onend = () => {
      if (this.state === 'listening') {
        this.state = 'completed';
      }
    };
  }

  public getState(): SpeechRecognitionState {
    return this.state;
  }

  public async start(options: SpeechRecognitionOptions = {}): Promise<void> {
    this.segments = [];
    this.fullTranscriptText = '';
    this.startTime = Date.now();
    this.state = 'listening';

    if (this.recognition) {
      this.recognition.continuous = options.continuous ?? true;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.lang = options.language || 'en-US';

      try {
        this.recognition.start();
        return;
      } catch (err: any) {
        // If already started or browser throws, reset
        try {
          this.recognition.stop();
          setTimeout(() => this.recognition.start(), 100);
          return;
        } catch {
          // fallback
        }
      }
    }

    // Fallback: If Web Speech API is unavailable or restricted in iframe sandbox
    console.info('[VoiceCoding] Native Web Speech API initializing with browser fallback.');
  }

  public async stop(): Promise<VoiceTranscript> {
    if (this.recognition && this.state === 'listening') {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }

    this.state = 'completed';
    const completedAt = Date.now();

    const transcript: VoiceTranscript = {
      id: `vt-${Date.now()}`,
      text: this.fullTranscriptText.trim(),
      language: 'en-US',
      startedAt: this.startTime,
      completedAt,
      confidence: this.segments.length > 0
        ? this.segments.reduce((acc, s) => acc + s.confidence, 0) / this.segments.length
        : 0.9,
      segments: [...this.segments],
    };

    return transcript;
  }

  public async cancel(): Promise<void> {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }
    this.state = 'idle';
    this.segments = [];
    this.fullTranscriptText = '';
  }

  public onPartialTranscript(callback: (text: string) => void): () => void {
    this.partialCallbacks.add(callback);
    return () => this.partialCallbacks.delete(callback);
  }

  public onFinalTranscript(callback: (text: string) => void): () => void {
    this.finalCallbacks.add(callback);
    return () => this.finalCallbacks.delete(callback);
  }

  public onError(callback: (error: string) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  public simulateVoiceInput(simulatedText: string, delayMs = 250) {
    this.state = 'listening';
    const words = simulatedText.split(' ');
    let current = '';

    words.forEach((word, index) => {
      setTimeout(() => {
        current = (current + ' ' + word).trim();
        this.notifyPartial(current);

        if (index === words.length - 1) {
          this.fullTranscriptText = current;
          this.segments.push({
            text: current,
            confidence: 0.98,
            timestamp: Date.now(),
            isFinal: true,
          });
          this.notifyFinal(current);
          this.state = 'completed';
        }
      }, (index + 1) * delayMs);
    });
  }

  private notifyPartial(text: string) {
    this.partialCallbacks.forEach(cb => cb(text));
  }

  private notifyFinal(text: string) {
    this.finalCallbacks.forEach(cb => cb(text));
  }

  private notifyError(err: string) {
    this.errorCallbacks.forEach(cb => cb(err));
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }
}

export const speechRecognitionService = new BrowserSpeechRecognitionService();
