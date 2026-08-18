import React from 'react';
import { Music, BookOpen, History, Settings } from 'lucide-react';

interface HeaderProps {
  round: number;
  onOpenRules: () => void;
  onOpenOptions: () => void;
  onOpenLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  round,
  onOpenRules,
  onOpenOptions,
  onOpenLogs,
}) => {
  return (
    <header className="bg-[#23160e] px-3 py-2 shadow-md flex justify-between items-center shrink-0 z-20 border-b border-[#3f2719]">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xs">
          <Music className="w-3.5 h-3.5" />
        </div>
        <h1 className="text-sm font-black text-amber-100 tracking-tight flex items-center gap-1.5">
          メロディ・ブリッジ
          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            R{round}/4
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <button 
          onClick={onOpenRules}
          className="flex items-center gap-1 px-2 py-1 bg-[#180f09] hover:bg-[#2e1c11] text-amber-200 text-xs font-bold rounded-lg border border-amber-700/50 transition active:scale-95 shadow-xs"
          title="遊び方・ルールを確認"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>遊び方</span>
        </button>

        <button 
          onClick={onOpenOptions}
          className="flex items-center gap-1 px-2 py-1 bg-[#180f09] hover:bg-[#2e1c11] text-amber-200 text-xs font-bold rounded-lg border border-amber-700/50 transition active:scale-95 shadow-xs"
          title="設定・Bot・統計"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span>設定</span>
        </button>

        <button 
          onClick={onOpenLogs}
          className="flex items-center gap-1 px-2 py-1 bg-[#180f09] hover:bg-[#2e1c11] text-amber-200 text-xs font-bold rounded-lg border border-amber-700/50 transition active:scale-95 shadow-xs"
          title="対戦履歴を確認"
        >
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>履歴</span>
        </button>
      </div>
    </header>
  );
};
