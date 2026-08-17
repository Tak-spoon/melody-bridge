import React from 'react';
import { Music, BookOpen, History } from 'lucide-react';

interface HeaderProps {
  round: number;
  onOpenRules: () => void;
  onOpenLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ round, onOpenRules, onOpenLogs }) => {
  return (
    <header className="bg-white/95 backdrop-blur-xs px-3 py-2 shadow-xs flex justify-between items-center shrink-0 z-20 border-b border-slate-200">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Music className="w-3.5 h-3.5" />
        </div>
        <h1 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
          メロディ・ブリッジ
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
            R{round}/4
          </span>
        </h1>
      </div>
      <div className="flex gap-1.5">
        <button 
          onClick={onOpenRules}
          className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200/80 transition active:scale-95 shadow-2xs"
          title="遊び方・ルールを確認"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>遊び方</span>
        </button>
        <button 
          onClick={onOpenLogs}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition active:scale-95 shadow-2xs"
          title="対戦履歴を確認"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>履歴</span>
        </button>
      </div>
    </header>
  );
};
