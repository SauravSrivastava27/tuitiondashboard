import React, { useState } from "react";
import Button from "./Button";

const CredentialsModal = ({ isOpen, onClose, credentials, studentName, studentId }) => {
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
      <div className="nb-modal max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b-3 border-nb-black pb-4 bg-nb-green/10 -m-8 p-8 mb-0">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-nb-green m-0 drop-shadow-[1px_1px_0px_black]">
              ✓ Success
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-nb-black/60 mt-1">
              Account created for {studentName}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-nb-pink border-2 border-nb-black p-1 leading-none hover:bg-pink-400 shadow-[2px_2px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <span className="text-xl font-bold text-white px-1">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="pt-8">
          <p className="font-bold text-sm text-nb-black/70 mb-6 italic border-l-4 border-nb-yellow pl-4">
            Share these credentials with the student. They can login and access their dashboard immediately.
          </p>

          {/* Student Info */}
          {studentId && (
            <div className="nb-card bg-nb-blue/5 border-2 shadow-[4px_4px_0px_black] mb-6 p-4 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Student ID</span>
              <code className="bg-white border-2 border-nb-black px-3 py-1 font-black text-xs">{studentId}</code>
            </div>
          )}

          {/* Credentials Box */}
          <div className="nb-card bg-white border-3 shadow-[6px_6px_0px_black] mb-8">
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 mb-2 block">Username</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-nb-yellow/5 border-2 border-nb-black p-3 font-black text-sm uppercase tracking-wider overflow-hidden text-ellipsis">
                  {credentials?.username}
                </code>
                <Button
                  onClick={() => handleCopy(credentials?.username, "username")}
                  variant={copied === "username" ? "primary" : "outline"}
                  size="sm"
                  className={`!shadow-none border-2 ${copied === "username" ? "bg-nb-green hover:bg-nb-green" : "bg-white"}`}
                >
                  {copied === "username" ? "✓" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 mb-2 block">Temporary Password</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-nb-pink/5 border-2 border-nb-black p-3 font-black text-sm tracking-widest overflow-hidden text-ellipsis">
                  {credentials?.password}
                </code>
                <Button
                  onClick={() => handleCopy(credentials?.password, "password")}
                  variant={copied === "password" ? "primary" : "outline"}
                  size="sm"
                  className={`!shadow-none border-2 ${copied === "password" ? "bg-nb-green hover:bg-nb-green" : "bg-white"}`}
                >
                  {copied === "password" ? "✓" : "Copy"}
                </Button>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="nb-card bg-nb-blue/5 border-2 shadow-none mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="bg-nb-blue text-white p-1 text-[10px] border border-nb-black">!</span> Next Steps
            </h3>
            <ul className="text-xs font-bold text-nb-black/70 space-y-3 list-none p-0">
              <li className="flex gap-3 items-start"><span className="text-nb-blue">→</span> Securely share credentials with the student.</li>
              <li className="flex gap-3 items-start"><span className="text-nb-blue">→</span> Student must login at the main portal.</li>
              <li className="flex gap-3 items-start"><span className="text-nb-blue">→</span> Changing password is recommended after first login.</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8">
          <Button 
            onClick={onClose} 
            variant="primary" 
            className="w-full uppercase tracking-widest py-3 bg-nb-green hover:bg-green-400"
          >
            Acknowledge & Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;

