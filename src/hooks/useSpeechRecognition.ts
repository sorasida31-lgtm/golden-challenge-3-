import { useState, useEffect, useRef, useCallback } from 'react';

// Define the shape of the speech recognition object and its event for cross-browser compatibility
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

// Check for the SpeechRecognition API, including prefixed versions
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setError('음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    const recognition: ISpeechRecognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex][0].transcript;
      setTranscript(result);
    };

    recognition.onerror = (event: any) => {
      // Ignore the 'aborted' error, which can happen if recognition is stopped programmatically
      // or by the user before a result is found. It's not a critical error.
      if (event.error === 'aborted') {
        return;
      }
      if (event.error === 'no-speech') {
        setError('음성이 감지되지 않았습니다. 다시 시도해주세요.');
      } else {
        setError(`음성 인식 오류: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup function to stop recognition if the component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch(e) {
        // This can happen if start() is called again before it's ready.
        console.error("Error starting speech recognition:", e);
        setError("마이크를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  }, [isListening]);
  
  const stopListening = useCallback(() => {
      if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
      }
  }, [isListening]);


  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    hasRecognitionSupport: !!SpeechRecognitionAPI,
  };
};