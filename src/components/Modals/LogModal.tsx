import React, { useEffect, useRef } from 'react';
import { History, X } from 'lucide-react';
import { LogEntry } from '../../types/game';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [isOpen, logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[80] p-4">
      <div className="bg-[#180f09] rounded-2xl p-4 max-w-sm w-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col max-h-[80vh] border-2 border-amber-500/60 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-3 border-b border-[#382315] pb-2.5">
          <h3 className="text-sm font-black text-amber-100 flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-400" />
            <span>対戦ログ・履歴</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-amber-400/70 hover:text-amber-200 p-1 rounded-lg hover:bg-[#281a10] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[11px]"
          ref={logContainerRef}
        >
          {(logs || []).map((log, i) => {
            const isUser = log.player === 'あなた';
            const isSystem = log.player === 'システム';

            return (
              <div 
                key={i} 
                className={`p-1.5 rounded-lg border text-xs flex gap-2 shadow-inner ${
                  isSystem 
                    ? 'bg-[#2e1c10] border-amber-500/80 text-amber-200 font-bold' 
                    : isUser 
                      ? 'bg-[#102d1f] border-emerald-500/80 text-emerald-100 font-bold' 
                      : 'bg-[#24170e] border-amber-900/60 text-amber-100/90'
                }`}
              >
                <span className={`font-black shrink-0 w-16 truncate border-r pr-1 text-[10px] ${
                  isUser ? 'border-emerald-700/60 text-emerald-300' : isSystem ? 'border-amber-700/60 text-amber-400' : 'border-amber-900/60 text-amber-400/70'
                }`}>
                  [{log.player}]
                </span>
                <span className="flex-1 leading-relaxed break-words">{log.text}</span>
              </div>
            );
          })}
        </div>
        
        <button 
          onClick={onClose} 
          className="mt-3 w-full py-2 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-md border border-amber-200 transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
