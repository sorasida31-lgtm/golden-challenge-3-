import React from 'react';

interface TipsModalProps {
  onClose: () => void;
}

const TipsModal: React.FC<TipsModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
    >
      <div 
        className="bg-parchment rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-modal-pop relative border-4 border-amber-800/60"
        onClick={e => e.stopPropagation()}
        style={{boxShadow: 'inset 0 0 20px rgba(120, 80, 30, 0.2)'}}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-amber-700/70 hover:text-amber-900 transition-colors p-1 rounded-full z-10"
          aria-label="Close tips"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900">게임왕 비법서 👑</h2>
        </div>

        <div className="space-y-6 text-stone-800 text-lg">
          <div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-2 flex items-center gap-2 justify-center">
              1단계: 알맞은 대답 찾기
            </h3>
            <p className="bg-blue-100/50 p-3 rounded-lg text-left">
              <strong>⭐ 꿀팁:</strong> 질문에 사용된 특별한 단어(<span className="font-bold text-blue-600">Do</span>, <span className="font-bold text-green-600">Is</span>, <span className="font-bold text-purple-600">Can</span>)를 잘 보세요. 정답은 항상 그 단어를 사용해서 대답해요!
            </p>
            <div className="mt-3 space-y-3 p-3 bg-white/40 rounded-lg">
              <div>
                <p><strong>예시 1)</strong> 질문: <span className="font-mono text-blue-600 font-bold">Do</span> you like pizza?</p>
                <p className="ml-4">➡️ 정답: Yes, I <span className="font-mono text-blue-600 font-bold">do</span>. / No, I <span className="font-mono text-blue-600 font-bold">don't</span>.</p>
              </div>
              <div>
                <p><strong>예시 2)</strong> 질문: <span className="font-mono text-green-600 font-bold">Is</span> she a student?</p>
                <p className="ml-4">➡️ 정답: Yes, she <span className="font-mono text-green-600 font-bold">is</span>. / No, she <span className="font-mono text-green-600 font-bold">isn't</span>.</p>
              </div>
              <div>
                <p><strong>예시 3)</strong> 질문: <span className="font-mono text-purple-600 font-bold">Can</span> he swim?</p>
                <p className="ml-4">➡️ 정답: Yes, he <span className="font-mono text-purple-600 font-bold">can</span>. / No, he <span className="font-mono text-purple-600 font-bold">can't</span>.</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-2 flex items-center gap-2 justify-center">
              2단계: 알맞은 단어 쓰기
            </h3>
            <p className="bg-amber-100/50 p-3 rounded-lg text-left">
              <strong>⭐ 꿀팁:</strong> 레벨 1과 같아요! 질문에 맞는 단어를 빈칸에 직접 써주세요. 긍정(<span className="font-bold">Yes</span>)인지 부정(<span className="font-bold text-red-600">No</span>)인지 잘 보고 답해야 해요.
            </p>
            <div className="mt-3 space-y-3 p-3 bg-white/40 rounded-lg">
              <div>
                <p><strong>예시 1)</strong> 질문: Do you like apples?</p>
                <p className="ml-4 flex items-center gap-2">➡️ 답변: Yes, I <span className="font-mono bg-white border-2 border-dashed border-gray-400 px-2 py-1 rounded-md text-xl font-bold">do</span>.</p>
              </div>
              <div>
                <p><strong>예시 2)</strong> 질문: Is he happy?</p>
                <p className="ml-4 flex items-center gap-2">➡️ 답변: <span className="text-red-600">No</span>, he <span className="font-mono bg-white border-2 border-dashed border-gray-400 px-2 py-1 rounded-md text-xl font-bold">isn't</span>.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-2 flex items-center gap-2 justify-center">
              3단계:알맞은 문장 부호와 단어 쓰기
            </h3>
            <p className="bg-rose-100/50 p-3 rounded-lg text-left">
              <strong>⭐ 꿀팁:</strong> 단어뿐만 아니라 쉼표(<span className="font-bold text-2xl">,</span>)와 마침표(<span className="font-bold text-2xl">.</span>)도 잊지 마세요! 'Yes'나 'No' 다음에는 항상 쉼표가 와요.
            </p>
            <div className="mt-3 space-y-3 p-3 bg-white/40 rounded-lg">
              <div>
                <p><strong>예시 1)</strong> 질문: Does she have a cat?</p>
                <p className="ml-4 flex items-center gap-1">➡️ 답변: Yes
                    <span className="font-mono bg-yellow-100 border-2 border-dashed border-gray-400 px-2 py-1 rounded-md text-xl font-bold">,</span>
                    &nbsp;she&nbsp;
                    <span className="font-mono bg-pink-100 border-2 border-dashed border-gray-400 px-2 py-1 rounded-md text-xl font-bold">does</span>
                    <span className="font-mono bg-yellow-100 border-2 border-dashed border-gray-400 px-2 py-1 rounded-md text-xl font-bold">.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={onClose} 
            className="bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-xl hover:bg-amber-800 transition transform hover:scale-105 shadow-md border-b-4 border-amber-900"
          >
            알겠어요!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipsModal;