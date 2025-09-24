import React, { useState } from 'react';
import type { StudentInfo, Rewards, Gender } from '../types';
import TextToSpeech from './TextToSpeech';

const RubyKeyIcon: React.FC<{ sizeClass?: string }> = ({ sizeClass = "w-10 h-10" }) => (
    <div className={sizeClass}>
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g transform="rotate(-45 32 32)">
          <circle cx="32" cy="19" r="15" fill="black" />
          <rect x="28" y="32" width="8" height="30" rx="4" fill="black" />
          <rect x="18" y="46" width="14" height="8" rx="4" fill="black" />
          <circle cx="32" cy="19" r="12" fill="#FF1493" />
          <rect x="30" y="34" width="4" height="26" rx="2" fill="#FF1493" />
          <rect x="20" y="48" width="10" height="4" rx="2" fill="#FF1493" />
          <circle cx="32" cy="19" r="7" fill="black" />
        </g>
      </svg>
    </div>
);

const SapphireKeyIcon: React.FC<{ sizeClass?: string }> = ({ sizeClass = "w-10 h-10" }) => (
    <div className={sizeClass}>
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <g transform="rotate(-45 32 32)">
          <circle cx="32" cy="19" r="15" fill="black" />
          <rect x="28" y="32" width="8" height="30" rx="4" fill="black" />
          <rect x="18" y="46" width="14" height="8" rx="4" fill="black" />
          <circle cx="32" cy="19" r="12" fill="#48D1CC" />
          <rect x="30" y="34" width="4" height="26" rx="2" fill="#48D1CC" />
          <rect x="20" y="48" width="10" height="4" rx="2" fill="#48D1CC" />
          <circle cx="32" cy="19" r="7" fill="black" />
        </g>
      </svg>
    </div>
);

const AnimatedTitle: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
    <h1 
        className={`text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-[linear-gradient(to_right,#FBBF24_0%,#FDE68A_20%,#FBBF24_40%,#D97706_60%,#FBBF24_80%,#FDE68A_100%)] drop-shadow-md bg-[200%_auto] animate-[text-shine_3s_linear_infinite] ${className}`}
        style={{
            fontFamily: "'Fredoka One', cursive",
            WebkitTextStroke: '1px #a16207'
        }}
    >
        {text}
    </h1>
);

interface StartScreenProps {
    onStartQuiz: (level: 1 | 2 | 3) => void;
    studentInfo: StudentInfo | null;
    setStudentInfo: (info: StudentInfo) => void;
    rewards: Rewards;
    level2Unlocked: boolean;
    level3Unlocked: boolean;
    isTimedMode: boolean;
    toggleTimedMode: () => void;
    onQuitRequest: () => void;
    challengeCount: number;
    successCount: number;
    gameKingCount: number;
}

const ScreenFooter: React.FC<{ onQuitRequest: () => void }> = ({ onQuitRequest }) => (
    <div className="mt-8 flex items-center justify-between">
        <div className="bg-amber-800 text-pink-200 font-bold py-2 px-4 rounded-lg shadow-inner text-sm">
            개발자: 황소라(수석교사, 2025)
        </div>
        <button 
            onClick={onQuitRequest} 
            className="bg-amber-800 text-pink-200 font-bold py-2 px-4 rounded-lg shadow-inner text-sm transition-colors hover:bg-amber-900"
        >
            EXIT / 나가기
        </button>
    </div>
);

const StartScreen: React.FC<StartScreenProps> = ({
    onStartQuiz,
    studentInfo,
    setStudentInfo,
    rewards,
    level2Unlocked,
    level3Unlocked,
    isTimedMode,
    toggleTimedMode,
    onQuitRequest,
    challengeCount,
    successCount,
    gameKingCount
}) => {
    const [grade, setGrade] = useState('');
    const [className, setClassName] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!grade.trim() || !className.trim() || !name.trim() || !gender) {
            setFormError('모든 정보를 입력해주세요.');
            return;
        }
        setStudentInfo({ grade, class: className, name, gender });
        setFormError(null);
    };

    if (!studentInfo) {
        return (
            <div className="animate-fade-in flex flex-col" style={{ minHeight: '65vh' }}>
                <div className="text-center">
                    <AnimatedTitle text="The Golden Challenge" />
                    <div className="flex justify-center items-center mt-2">
                        <TextToSpeech text="The Golden Challenge" />
                    </div>
                    <h2 className="text-2xl font-bold text-amber-500 opacity-70 mt-1" style={{ textShadow: '1px 1px 2px #fff8e1' }}>
                        황금빛 도전
                    </h2>
                </div>

                <div className="flex-grow flex flex-col justify-center">
                    <div className="pt-10">
                        <p className="text-lg text-stone-700 text-center mb-4">황금 닭을 구출하기 위해 당신의 정보를 알려주세요.</p>
                        <form onSubmit={handleSubmit} className="bg-orange-100/60 p-6 rounded-lg shadow-md space-y-4 max-w-lg mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="학년 (예: 4)"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full p-3 rounded-lg border-2 border-orange-400/60 bg-gradient-to-b from-white to-orange-200 shadow-inner shadow-orange-300/80 transition-all duration-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:shadow-lg focus:shadow-pink-500/20"
                                    aria-label="학년"
                                />
                                <input
                                    type="text"
                                    placeholder="반 (예: 2)"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="w-full p-3 rounded-lg border-2 border-orange-400/60 bg-gradient-to-b from-white to-orange-200 shadow-inner shadow-orange-300/80 transition-all duration-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:shadow-lg focus:shadow-pink-500/20"
                                     aria-label="반"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="이름 (예: 황소라)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 rounded-lg border-2 border-orange-400/60 bg-gradient-to-b from-white to-orange-200 shadow-inner shadow-orange-300/80 transition-all duration-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:shadow-lg focus:shadow-pink-500/20"
                                 aria-label="이름"
                            />
                            <fieldset>
                                <legend className="sr-only">성별</legend>
                                <div className="flex justify-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-orange-200/50">
                                        <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-400"/>
                                        <span className="font-semibold">남자</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-orange-200/50">
                                        <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-400"/>
                                        <span className="font-semibold">여자</span>
                                    </label>
                                </div>
                            </fieldset>
                            {formError && <p className="text-red-500 font-semibold">{formError}</p>}
                            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg text-xl hover:bg-green-700 transition transform hover:scale-105 shadow-md">
                                모험 시작하기
                            </button>
                        </form>
                    </div>
                </div>
                
                <ScreenFooter onQuitRequest={onQuitRequest} />
            </div>
        );
    }
    
    const requiredKeysForUnlock = isTimedMode ? 1 : 2;

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-6">
                <AnimatedTitle text="모험을 선택하세요!" />
                <p className="text-xl text-stone-700">{studentInfo.grade}학년 {studentInfo.class}반 {studentInfo.name}님, 환영합니다!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Level 1 */}
                <div className="bg-green-100 p-4 rounded-lg shadow-lg border-2 border-green-300 text-center">
                    <h2 className="text-2xl font-bold text-green-800">1단계</h2>
                    <p className="text-green-700 mb-4">알맞은 대답 고르기</p>
                    <button onClick={() => onStartQuiz(1)} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-green-600 transition transform hover:scale-105 shadow-md">
                        도전하기
                    </button>
                </div>

                {/* Level 2 */}
                <div className={`p-4 rounded-lg shadow-lg border-2 text-center transition-opacity ${level2Unlocked ? 'bg-blue-100 border-blue-300' : 'bg-gray-200 border-gray-300 opacity-60'}`}>
                    <h2 className={`text-2xl font-bold ${level2Unlocked ? 'text-blue-800' : 'text-gray-500'}`}>2단계</h2>
                    <p className={`${level2Unlocked ? 'text-blue-700' : 'text-gray-500'} mb-4`}>빈칸에 단어 쓰기</p>
                    <button onClick={() => onStartQuiz(2)} disabled={!level2Unlocked} className="w-full text-white font-bold py-3 px-4 rounded-lg text-lg transition transform shadow-md disabled:cursor-not-allowed enabled:hover:scale-105 enabled:hover:bg-blue-600 enabled:bg-blue-500 disabled:bg-gray-400 flex items-center justify-center gap-1">
                        {level2Unlocked ? '도전하기' : (
                            <div className="flex items-center justify-center gap-1">
                                <RubyKeyIcon sizeClass="w-5 h-5" />
                                <span className="text-base">{rewards.rubyKeys} / {requiredKeysForUnlock}개 필요</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* Level 3 */}
                <div className={`p-4 rounded-lg shadow-lg border-2 text-center transition-opacity ${level3Unlocked ? 'bg-purple-100 border-purple-300' : 'bg-gray-200 border-gray-300 opacity-60'}`}>
                    <h2 className={`text-2xl font-bold ${level3Unlocked ? 'text-purple-800' : 'text-gray-500'}`}>3단계</h2>
                    <p className={`${level3Unlocked ? 'text-purple-700' : 'text-gray-500'} mb-4`}>문장 부호 완성하기</p>
                    <button onClick={() => onStartQuiz(3)} disabled={!level3Unlocked} className="w-full text-white font-bold py-3 px-4 rounded-lg text-lg transition transform shadow-md disabled:cursor-not-allowed enabled:hover:scale-105 enabled:hover:bg-purple-600 enabled:bg-purple-500 disabled:bg-gray-400 flex items-center justify-center gap-1">
                         {level3Unlocked ? '도전하기' : (
                            <div className="flex items-center justify-center gap-1">
                                <SapphireKeyIcon sizeClass="w-5 h-5" />
                                <span className="text-base">{rewards.sapphireKeys} / {requiredKeysForUnlock}개 필요</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
                    <h3 className="text-xl font-bold text-yellow-800 mb-3 text-center">나의 아이템</h3>
                     <div className="flex justify-around items-center">
                        <div className="flex items-center gap-2">
                            <RubyKeyIcon sizeClass="w-10 h-10" />
                            <div className="text-left leading-tight">
                                <span className="text-sm font-semibold text-pink-600">루비</span>
                                <p className="font-bold text-lg">{rewards.rubyKeys}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <SapphireKeyIcon sizeClass="w-10 h-10" />
                             <div className="text-left leading-tight">
                                <span className="text-sm font-semibold text-cyan-600">사파이어</span>
                                <p className="font-bold text-lg">{rewards.sapphireKeys}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-4xl" style={{ color: '#FFD700', textShadow: '0 0 8px #FCE570' }}>🔑</span>
                             <div className="text-left leading-tight">
                                <span className="text-sm font-semibold text-yellow-600">황금</span>
                                <p className="font-bold text-lg">{rewards.goldenKeys}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-sky-100 border-2 border-sky-300 rounded-lg flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-sky-800 mb-2 text-center">게임 모드 설정</h3>
                    <div className="flex items-center justify-center gap-4">
                        <span className={`font-bold ${!isTimedMode ? 'text-blue-600' : 'text-gray-500'}`}>📚 신중 모드</span>
                         <label htmlFor="toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input id="toggle" type="checkbox" className="sr-only peer" checked={isTimedMode} onChange={toggleTimedMode} />
                                <div className="block bg-gray-400 peer-checked:bg-green-500 w-14 h-8 rounded-full transition-colors"></div>
                                <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform peer-checked:translate-x-6"></div>
                            </div>
                        </label>
                        <span className={`font-bold ${isTimedMode ? 'text-green-600' : 'text-gray-500'}`}>🚀 스피드 모드</span>
                    </div>
                </div>
                
                 <div className="md:col-span-2 p-4 bg-orange-100 border-2 border-orange-300 rounded-lg text-center">
                    <h3 className="text-xl font-bold text-orange-800 mb-2">나의 모험 기록</h3>
                    <div className="flex justify-around items-center text-orange-900 font-semibold">
                        <span>도전 횟수: {challengeCount}</span>
                        <span>성공 횟수: {successCount}</span>
                        <span>게임 왕 등극: {gameKingCount}회</span>
                    </div>
                </div>
            </div>
            <ScreenFooter onQuitRequest={onQuitRequest} />
        </div>
    );
};

export default StartScreen;