import React from 'react';

interface InstructionsModalProps {
  onClose: () => void;
  isTimedMode: boolean;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose, isTimedMode }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
    >
      <div 
        className="bg-parchment rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-modal-pop relative border-4 border-amber-800/60"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
        style={{boxShadow: 'inset 0 0 20px rgba(120, 80, 30, 0.2)'}}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-amber-700/70 hover:text-amber-900 transition-colors p-1 rounded-full z-10"
          aria-label="Close instructions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900">모험 안내서 📜</h2>
        </div>

        <div className="space-y-6 text-stone-700 text-lg">
          <div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-2 flex items-center gap-2 justify-center">
              <span className="text-2xl">🐔</span>
              <span>황금 닭 이야기</span>
              <span className="text-2xl">✨</span>
            </h3>
            <p className="bg-amber-100/50 p-3 rounded-lg text-center">
              먼 옛날, 평화로운 마을에 지혜의 알을 낳는 신비한 '황금 닭'이 살고 있었어요. 하지만 그 아름다움을 시기한 심술궂은 마법사가 황금 닭을 눈부신 '황금 새장'에 가둬버렸답니다. 이제 마법의 열쇠를 모아 황금 닭을 새장에서 풀어줄 진정한 영웅은 바로 당신이에요!
            </p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span className="text-2xl">🔑</span>
              <span>열쇠 모으는 법</span>
            </h3>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border-2 ${isTimedMode ? 'border-green-500 bg-green-100/50' : 'border-gray-300'}`}>
                <h4 className="font-bold text-green-700 text-xl mb-1">타이머 ON (🚀 스피드 모드)</h4>
                <p>
                  한 번에 퀴즈를 <span className="font-bold text-green-600">만점</span> 통과하면 열쇠를 바로 획득해요! 만약 틀렸다면, <span className="font-bold text-sky-600">'틀린 문제 다시 풀기'</span> 재시험에서 모두 맞히면 열쇠를 얻을 수 있어요.
                </p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${!isTimedMode ? 'border-blue-500 bg-blue-100/50' : 'border-gray-300'}`}>
                <h4 className="font-bold text-blue-700 text-xl mb-1">타이머 OFF (📚 신중 모드)</h4>
                <p>
                  꼼꼼한 학습을 위한 모드! 각 레벨에서 <span className="font-bold text-blue-600">완전히 새로운 문제들로 80점 이상</span>을 <span className="font-bold text-blue-600">총 2번</span> 받아야 다음 레벨로 가는 열쇠를 모두 모을 수 있어요. 만약 80점이 안 되면 열쇠를 받을 수 없으니 다시 도전해야 해요!
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span>레벨 진행 방법</span>
            </h3>
            <p className="bg-amber-100/50 p-3 rounded-lg">
              다음 단계의 문제를 풀기 위해 필요한 열쇠 개수를 확인하세요!
              <span className="block mt-2 font-semibold">
                - <span className="text-green-700">스피드 모드:</span> 열쇠 1개 필요<br/>
                - <span className="text-blue-700">신중 모드:</span> 열쇠 2개 필요
              </span>
            </p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span>최종 목표</span>
            </h3>
            <p>
              레벨 3까지 통과하고 <span className="font-bold text-yellow-600">'🌟 황금 열쇠'</span>를 모아 황금 닭을 구출하면 게임의 왕이 됩니다!
               <span className="block mt-2 font-semibold text-red-600 bg-red-100/70 p-2 rounded-md text-center">
                {isTimedMode 
                  ? "스피드 모드에서는 황금 열쇠 1개만 있으면 구출 성공!" 
                  : "신중 모드에서는 황금 열쇠 2개가 필요해요!"
                }
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={onClose} 
            className="bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-xl hover:bg-amber-800 transition transform hover:scale-105 shadow-md border-b-4 border-amber-900"
          >
            확인했어요!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;