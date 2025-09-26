import React, { useState, useEffect, useRef } from 'react';
import type { QuizItemL2, StudentInfo } from '../types';
import TextToSpeech from './TextToSpeech';
import Timer from './Timer';
import { playCorrectSound, playIncorrectSound } from '../services/soundService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface QuizScreenL2Props {
  quizItem: QuizItemL2;
  studentInfo: StudentInfo | null;
  onAnswerSubmit: (isCorrect: boolean) => void;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  isTimedMode: boolean;
  isRetestMode: boolean;
  onQuitRequest: () => void;
}

const RightArrowIcon: React.FC = () => (
    <svg className="h-6 w-6 ml-2" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 4l8 8-8 8-1.41-1.41L16.17 13H4v-2h12.17l-5.58-5.59L12 4z" clipRule="evenodd" />
    </svg>
);

const MicrophoneIcon: React.FC<{ isListening?: boolean }> = ({ isListening }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isListening ? 'text-red-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm0 12a1 1 0 0 1-1-1V4a1 1 0 0 1 2 0v8a1 1 0 0 1-1 1z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V24h2v-3.06A9 9 0 0 0 21 12v-2z"/>
    </svg>
);


const QUIZ_DURATION = 25;

const QuizScreenL2: React.FC<QuizScreenL2Props> = ({ quizItem, studentInfo, onAnswerSubmit, onNext, questionNumber, totalQuestions, isTimedMode, isRetestMode, onQuitRequest }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    transcript,
    startListening,
    isListening,
    error: speechError,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    setInputValue('');
    setIsAnswered(false);
    setIsCorrect(false);
    setAnimationClass('');
    setFeedbackMessage(null);
    setTimeLeft(QUIZ_DURATION);
    inputRef.current?.focus();
  }, [quizItem]);
  
  useEffect(() => {
    if (transcript && !isAnswered) {
      const cleanedTranscript = transcript.endsWith('.') ? transcript.slice(0, -1) : transcript;
      setInputValue(cleanedTranscript);
    }
  }, [transcript]);

  const handleTimeout = () => {
    if (isAnswered) return;
    playIncorrectSound();
    setAnimationClass('animate-shake-horizontal');
    if (studentInfo) {
      setFeedbackMessage(`시간 초과, ${studentInfo.name}!`);
    } else {
      setFeedbackMessage('시간 초과!');
    }
    setIsCorrect(false);
    setIsAnswered(true);
    onAnswerSubmit(false); // Submit as incorrect
  };

  // Timer effect
  useEffect(() => {
    if (!isTimedMode || isAnswered || isRetestMode) return;
    if (timeLeft === 0) {
      handleTimeout();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isTimedMode, isAnswered, timeLeft, isRetestMode]);


  const checkAnswer = () => {
    if (!inputValue.trim() || isAnswered) return;

    const userAnswer = inputValue.trim().toLowerCase();
    const wasCorrect = quizItem.correctAnswers.some(ans => ans.toLowerCase() === userAnswer);
    
    if (wasCorrect) {
        playCorrectSound();
        setAnimationClass('animate-correct-answer-pop');
    } else {
        playIncorrectSound();
        setAnimationClass('animate-shake-horizontal');
    }
    
    if (studentInfo) {
      const name = studentInfo.name;
      if (wasCorrect) {
        const messages = [`잘했어, ${name}!`, `오~ ${name}! 대단한데.`, `아니, ${name}! 이걸 맞히다니!`, `${name}, 혹시 천재?`, `정답이야, ${name}! 똑똑하구나.`, `완벽해, ${name}!`];
        setFeedbackMessage(messages[Math.floor(Math.random() * messages.length)]);
      } else {
        if (userAnswer === 'amnot' && quizItem.correctAnswers.includes('am not')) {
             setFeedbackMessage(`거의 맞았어요, ${name}! 'am not'처럼 띄어 써야 해요.`);
        } else {
            const messages = [`아깝다, ${name}!`, `괜찮아, ${name}. 다음엔 맞힐 수 있어.`, `힘내, ${name}!`];
            setFeedbackMessage(messages[Math.floor(Math.random() * messages.length)]);
        }
      }
    }

    setIsCorrect(wasCorrect);
    setIsAnswered(true);
    onAnswerSubmit(wasCorrect);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        if (!isAnswered) {
            checkAnswer();
        } else {
            onNext();
        }
    }
  };

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && isAnswered) {
            onNext();
        }
    };
    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [isAnswered, onNext]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnswered) return;
    setInputValue(e.target.value);
  };

  const [promptBefore, promptAfter] = quizItem.answerPrompt.split('___');
  const isNegativePrompt = promptBefore.trim().toLowerCase().startsWith('no');

  const getInputClass = () => {
    if (!isAnswered) return 'border-blue-400 focus:border-blue-600 focus:ring-blue-300';
    return isCorrect ? 'border-green-500 bg-green-50 ring-green-500 text-green-800' : 'border-red-500 bg-red-50 ring-red-500 text-red-800';
  };

  return (
    <div className="w-full animate-fade-in">
       <div className="flex justify-between items-center mb-6">
        <div className="flex-grow">
            <p className="text-lg font-semibold text-gray-500 text-left">
              {isRetestMode ? `틀린 문제 다시 풀기 (${questionNumber}/${totalQuestions})` : `Question ${questionNumber} / ${totalQuestions}`}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2.5 rounded-full" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}></div>
            </div>
        </div>
        <div className="flex items-center ml-4">
            {isTimedMode && !isRetestMode && <Timer timeLeft={timeLeft} duration={QUIZ_DURATION} />}
            <button 
                onClick={onQuitRequest} 
                className="ml-4 bg-stone-600 text-pink-300 font-bold py-2.5 px-4 rounded-xl text-base hover:bg-stone-700 transition transform hover:scale-105 shadow-lg border-b-4 border-stone-800 flex flex-col items-center leading-tight"
            >
                <span>EXIT</span>
                <span>끝내기</span>
            </button>
        </div>
      </div>
      
      <div className="p-4 bg-blue-100 rounded-lg mb-8">
          <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {quizItem.question}
              </h2>
              <TextToSpeech text={quizItem.question} />
          </div>
          <p className="text-md text-gray-500 mt-1">{quizItem.question_kr}</p>
      </div>

      <div className={`my-8 text-2xl flex items-center justify-center flex-wrap gap-2 p-4 bg-gray-50 rounded-lg ${animationClass}`} aria-live="polite">
        <label htmlFor="answer-input" className="sr-only">Answer</label>
        <span className={`text-gray-700 font-semibold ${isNegativePrompt ? 'text-red-500' : ''}`}>{promptBefore}</span>
        <input
          id="answer-input"
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isAnswered}
          className={`w-36 text-center text-2xl font-bold border-2 rounded-lg p-2 transition-all duration-300 focus:ring-2 ${getInputClass()}`}
          aria-label="Your answer"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck="false"
        />
        <span className="text-gray-700">{promptAfter}</span>
         {hasRecognitionSupport && !isAnswered && (
            <button
                onClick={() => startListening()}
                disabled={isListening}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-200 animate-pulse' : 'bg-gray-200 hover:bg-gray-300'}`}
                title="음성으로 답변하기"
            >
                <MicrophoneIcon isListening={isListening} />
            </button>
        )}
      </div>
      
      <div className="text-center h-6 mb-2">
        {isListening && !isAnswered && <p className="text-blue-600 font-semibold animate-pulse">듣고 있어요...</p>}
        {speechError && !isAnswered && <p className="text-red-500 font-semibold">{speechError}</p>}
      </div>

      {isAnswered && (
        <div className="mt-4 text-center font-semibold text-lg animate-fade-in">
          {feedbackMessage && (
              <div className="relative mb-4 flex justify-center">
                  <div className={`text-white font-bold rounded-lg px-4 py-2 shadow-md text-lg ${isCorrect ? 'bg-sky-400' : 'bg-orange-400'}`}>
                      {feedbackMessage}
                  </div>
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${isCorrect ? 'border-t-sky-400' : 'border-t-orange-400'}`}></div>
              </div>
          )}
          {!isCorrect && (
            <div className="mt-2 text-base p-2 bg-green-100 border border-green-300 rounded-md">
                <span className="text-gray-700 font-medium">정답: </span>
                <span className="font-bold text-green-700">{quizItem.correctAnswers.join(' / ')}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        {!isAnswered ? (
          <button
            onClick={checkAnswer}
            className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-8 py-3 bg-purple-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300 inline-flex items-center justify-center"
          >
            <span>{questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}</span>
            <span className="text-white"><RightArrowIcon/></span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizScreenL2;