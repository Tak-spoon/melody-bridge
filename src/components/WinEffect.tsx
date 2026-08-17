import React from 'react';

interface WinEffectProps {
  winnerName: string;
}

export const WinEffect: React.FC<WinEffectProps> = ({ winnerName }) => {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* 背景ディマー */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in duration-200" />

      {/* 衝撃波リング */}
      <div className="absolute w-48 h-48 rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-win-ring" />

      {/* メインのズームインパクト・エンブレム */}
      <div className="relative z-10 flex flex-col items-center justify-center animate-win-impact">
        {/* 勝者名バッジ */}
        <div className="px-3 py-0.5 rounded-full bg-amber-500/90 text-slate-950 font-black text-xs tracking-widest uppercase shadow-md mb-2">
          {winnerName}
        </div>

        {/* 特大「アガリ！」立体文字プレート */}
        <div className="relative px-8 py-3 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border-2 border-yellow-100 shadow-[0_10px_25px_rgba(245,158,11,0.5),0_0_40px_rgba(251,191,36,0.4)] flex items-center justify-center">
          <span className="text-4xl sm:text-5xl font-black italic tracking-wider text-amber-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]">
            アガリ！
          </span>
        </div>
      </div>
    </div>
  );
};
