import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="nb-modal max-w-[550px] w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6 border-b-3 border-nb-black pb-4">
          <h2 className="text-2xl font-bold uppercase m-0 tracking-tight">{title}</h2>
          <button 
            className="bg-nb-pink border-2 border-nb-black p-1 leading-none hover:bg-pink-400 active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_black]" 
            onClick={onClose}
          >
            <span className="text-xl font-bold text-white px-1">✕</span>
          </button>
        </div>
        <div className="text-nb-black font-medium">{children}</div>
      </div>
    </div>
  );
}

