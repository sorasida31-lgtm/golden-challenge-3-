import React from 'react';

interface QuitConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const QuitConfirmationModal: React.FC<QuitConfirmationModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onCancel}
    >
      <div 
        className="bg-parchment rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all animate-modal-pop relative border-4 border-amber-800/60 text-center"
        onClick={e => e.stopPropagation()}
        style={{boxShadow: 'inset 0 0 20px rgba(120, 80, 30, 0.2)'}}
      >
        <h2 className="text-2xl font-bold text-amber-900 mb-6">정말 끝내기를 원하시나요?</h2>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onConfirm} 
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-lg hover:bg-red-700 transition transform hover:scale-105 shadow-md"
          >
            네, 끝낼래요
          </button>
          <button 
            onClick={onCancel} 
            className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg text-lg hover:bg-gray-600 transition transform hover:scale-105 shadow-md"
          >
            아니요, 계속할래요
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuitConfirmationModal;