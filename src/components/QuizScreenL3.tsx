import React, { useState, useEffect, useRef } from 'react';
import type { QuizItemL3, StudentInfo } from '../types';
import TextToSpeech from './TextToSpeech';
import Timer from './Timer';
import { playCorrectSound, playIncorrectSound, playBoopSound } from '../services/soundService';

interface QuizScreenL3Props {
  quizItem: QuizItemL3;
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

const ExampleView: React.FC<{ onStart: () => void; }> = ({ onStart }) => {
    const exampleQuestion = {
        question: "Is she your sister?",
        question_kr: "그녀는 너의 언니니?",
        answerPrompt: "Yes___ she ___ ___",
        correctAnswers: [',', 'is', '.'],
    };

    const [filledAnswers, setFilledAnswers] = useState<string[]>(['', '', '']);
    
    useEffect(() => {
        const timeouts = [
            setTimeout(() => { playBoopSound(); setFilledAnswers(p => [exampleQuestion.correctAnswers[0], p[1], p[2]]) }, 1000),
            setTimeout(() => { playBoopSound(); setFilledAnswers(p => [p[0], exampleQuestion.correctAnswers[1], p[2]]) }, 1800),
            setTimeout(() => { playBoopSound(); setFilledAnswers(p => [p[0], p[1], exampleQuestion.correctAnswers[2]]) }, 2600),
        ];
        return () => timeouts.forEach(clearTimeout);
    }, []);

    const isPunctuation = (char: string) => char.length === 1 && ['.', ',', '!', '?'].includes(char);
    const promptParts = exampleQuestion.answerPrompt.split('___');

    return (
        <div className="w-full animate-fade-in text-center p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-2xl font-bold text-indigo-800 mb-3">⭐ 레벨 3 시작하기 전에...</h2>
            <p className="text-gray-600 mb-6">빈칸에는 알맞은 단어와 문장부호를 넣어야 해요. 이렇게요!</p>

            <div className="p-4 bg-blue-100 rounded-lg mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{exampleQuestion.question}</h3>
                <p className="text-md text-gray-500 mt-1">{exampleQuestion.question_kr}</p>
            </div>
            
            <div className="my-6 text-2xl flex items-center justify-center flex-wrap gap-x-2 gap-y-4 p-4 bg-white rounded-lg shadow-md">
              {promptParts.map((part, index) => (
                <React.Fragment key={index}>
                    <span className="text-gray-700 font-semibold">{part}</span>
                    {index < exampleQuestion.correctAnswers.length && (
                        <input
                            type="text"
                            value={filledAnswers[index]}
                            readOnly
                            className={`text-center text-2xl font-bold border-2 rounded-lg p-2 transition-all duration-500 ease-out transform scale-100 ${
                                isPunctuation(exampleQuestion.correctAnswers[index]) 
                                ? 'bg-yellow-200 border-yellow-400' 
                                : 'bg-pink-200 border-pink-400'
                            } ${
                                filledAnswers[index] ? 'scale-110' : 'scale-100'
                            } ${exampleQuestion.correctAnswers[index].length === 1 ? 'w-16' : 'w-28'}`}
                        />
                    )}
                </React.Fragment>
              ))}
            </div>

            <p className="text-indigo-700 font-semibold mb-6">
                🌸 단어는 분홍색 칸에, 🌟 문장부호는 노란색 칸에 써주세요!
            </p>

            <div className="flex justify-center gap-4">
                 <button onClick={onStart} className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110">
                    퀴즈 시작!
                </button>
                <button onClick={onStart} className="text-sm text-gray-500 hover:text-gray-800">
                    (예시 건너뛰기)
                </button>
            </div>
        </div>
    );
};


const QUIZ_DURATION = 25;

const QuizScreenL3: React.FC<QuizScreenL3Props> = ({ quizItem, studentInfo, onAnswerSubmit, onNext, questionNumber, totalQuestions, isTimedMode, isRetestMode, onQuitRequest }) => {
  const [showExample, setShowExample] = useState(true);
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const promptParts = quizItem.answerPrompt.split('___');
  const numBlanks = quizItem.correctAnswers.length;

  useEffect(() => {
    setInputValues(Array(numBlanks).fill(''));
    setIsAnswered(false);
    setIsCorrect(false);
    setAnimationClass('');
    setFeedbackMessage(null);
    setTimeLeft(QUIZ_DURATION);
    inputRefs.current = inputRefs.current.slice(0, numBlanks);
    if (!showExample) {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [quizItem, numBlanks, showExample]);

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
    if (showExample || !isTimedMode || isAnswered || isRetestMode) return;
    if (timeLeft === 0) {
      handleTimeout();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isTimedMode, isAnswered, timeLeft, showExample, isRetestMode]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (isAnswered) return;
    const newValues = [...inputValues];
    newValues[index] = e.target.value;
    setInputValues(newValues);
  };

  const checkAnswer = () => {
    if (inputValues.some(val => !val.trim() && val !== ',') || isAnswered) return;

    const wasCorrect = inputValues.every((val, index) => val.trim().toLowerCase() === quizItem.correctAnswers[index].toLowerCase());

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
        const messages = [`아깝다, ${name}!`, `괜찮아, ${name}. 다음엔 맞힐 수 있어.`, `힘내, ${name}!`];
        setFeedbackMessage(messages[Math.floor(Math.random() * messages.length)]);
      }
    }

    setIsCorrect(wasCorrect);
    setIsAnswered(true);
    onAnswerSubmit(wasCorrect);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      if (!isAnswered) {
        if (index < numBlanks - 1) {
            inputRefs.current[index + 1]?.focus();
        } else {
            checkAnswer();
        }
      } else {
        onNext();
      }
    } else if (e.key === 'ArrowRight') {
        if (index < numBlanks - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    } else if (e.key === 'ArrowLeft') {
        if (index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }
  };
  
  const isNegativePrompt = promptParts[0]?.trim().toLowerCase().startsWith('no');
  const isPunctuation = (char: string) => char.length === 1 && ['.', ',', '!', '?'].includes(char);

  const getInputClass = (index: number) => {
    if (isAnswered) {
        return isCorrect ? 'border-green-500 bg-green-50 ring-green-500 text-green-800' : 'border-red-500 bg-red-50 ring-red-500 text-red-800';
    }
    const isPunc = isPunctuation(quizItem.correctAnswers[index]);
    return isPunc
        ? 'bg-yellow-100 border-yellow-400 focus:ring-yellow-300'
        : 'bg-pink-100 border-pink-400 focus:ring-pink-300';
  };

  if (showExample && !isRetestMode) {
    return <ExampleView onStart={() => setShowExample(false)} />;
  }

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

      <div className={`my-8 text-2xl flex items-center justify-center flex-wrap gap-x-2 gap-y-4 p-4 bg-gray-50 rounded-lg ${animationClass}`} aria-live="polite">
        {promptParts.map((part, index) => (
          <React.Fragment key={index}>
            <span className={`text-gray-700 font-semibold ${index === 0 && isNegativePrompt ? 'text-red-500' : ''}`}>{part}</span>
            {index < numBlanks && (
              <input
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                value={inputValues[index]}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isAnswered}
                className={`text-center text-2xl font-bold border-2 rounded-lg p-2 transition-all duration-300 focus:ring-2 ${getInputClass(index)} ${quizItem.correctAnswers[index].length === 1 ? 'w-16' : 'w-28'}`}
                aria-label={`Answer part ${index + 1}`}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck="false"
              />
            )}
          </React.Fragment>
        ))}
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
                <span className="font-bold text-green-700">"{promptParts.map((p, i) => `${p}${quizItem.correctAnswers[i] || ''}`).join('')}"</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        {!isAnswered ? (
          <button onClick={checkAnswer} className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110">
            Check Answer
          </button>
        ) : (
          <button onClick={onNext} className="px-8 py-3 bg-red-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-110 inline-flex items-center justify-center">
            <span>{questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}</span>
            <span className="text-white"><RightArrowIcon/></span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizScreenL3;