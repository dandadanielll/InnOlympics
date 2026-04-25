// Web Speech API wrapper — push-to-talk pattern
// Handles Filipino/Taglish code-switching with fil-PH → en-US fallback

export interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  lang?: string;
}

let recognition: SpeechRecognition | null = null;

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function startListening(options: SpeechRecognitionOptions): void {
  if (!isVoiceSupported()) {
    options.onError?.('Voice input is not supported on this browser.');
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = options.lang || 'fil-PH';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    options.onResult(transcript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === 'language-not-supported') {
      // Fallback to en-US
      if (recognition) {
        recognition.lang = 'en-US';
        recognition.start();
        return;
      }
    }
    options.onError?.(event.error);
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

// Text-to-Speech playback
export interface SpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  onEnd?: () => void;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, options: SpeechSynthesisOptions = {}): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  stopSpeaking();

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = options.lang || 'fil-PH';
  currentUtterance.rate = options.rate || 1;

  currentUtterance.onend = () => {
    options.onEnd?.();
    currentUtterance = null;
  };

  window.speechSynthesis.speak(currentUtterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return typeof window !== 'undefined' &&
    window.speechSynthesis?.speaking === true;
}
