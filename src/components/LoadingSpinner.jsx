import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-12">
      <div className="w-12 h-12 bg-nb-yellow border-4 border-nb-black shadow-[4px_4px_0px_black] animate-[spin_1s_steps(4)_infinite]" />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

