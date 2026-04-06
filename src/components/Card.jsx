import React from "react";

export default function Card({ title, children, icon, className = "", showTitleBar = false }) {
  return (
    <div className={`nb-card group ${className}`}>
      {showTitleBar && title && (
        <div className="nb-card-header !-mt-6 !-mx-6 mb-6">
          <div className="flex items-center gap-2">
            {icon && <span>{icon}</span>}
            <span>{title}</span>
          </div>
          <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 rounded-full bg-white border border-nb-black/20"></div>
            <div className="w-2 h-2 rounded-full bg-white border border-nb-black/20"></div>
          </div>
        </div>
      )}
      {!showTitleBar && title && (
        <div className="flex items-center gap-3 mb-6 border-b-3 border-nb-black/10 pb-2">
          {icon && <span className="text-2xl filter drop-shadow-[2px_2px_0px_black]">{icon}</span>}
          <h3 className="text-xl font-black uppercase m-0 leading-none tracking-tighter">{title}</h3>
        </div>
      )}
      <div className="text-nb-black font-bold">
        {children}
      </div>
    </div>
  );
}


