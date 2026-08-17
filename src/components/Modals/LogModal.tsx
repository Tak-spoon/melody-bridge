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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl flex flex-col max-h-[80vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2.5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-600" />
            <span>対戦ログ・履歴</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]"
          ref={logContainerRef}
        >
          {(logs || []).map((log, i) => {
            const isUser = log.player === 'あなた';
            const isSystem = log.player === 'システム';

            return (
              <div 
                key={i} 
                className={`p-1.5 rounded-lg border text-xs flex gap-2 shadow-2xs ${
                  isSystem 
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' 
                    : isUser 
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium' 
                      : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-bold shrink-0 w-16 truncate border-r border-slate-200 pr-1 text-[10px]">
                  [{log.player}]
                </span>
                <span className="flex-1 leading-relaxed break-words">{log.text}</span>
              </div>
            );
          })}
        </div>
        
        <button 
          onClick={onClose} 
          className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl text-xs shadow-xs transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
